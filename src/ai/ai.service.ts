import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';

import { OpenAIProvider } from './providers/openai.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenRouterProvider } from './providers/openrouter.provider';

import { Conversation } from '../conversations/entities/conversion.entity';
import { Message, MessageRole } from '../conversations/entities/message.entity';

import { ConversationsService } from '../conversations/conversation.service';

@Injectable()
export class AiService {
  constructor(
    private readonly conversationsService: ConversationsService,

    private readonly openAIProvider: OpenAIProvider,
    private readonly geminiProvider: GeminiProvider,
    private readonly openRouterProvider: OpenRouterProvider,

    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,

    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  private async generateConversationTitle(
    provider: string,
    message: string,
  ): Promise<string> {
    const prompt = `
Generate a short title for this conversation.

User message:
"${message}"

Rules:
- Maximum 6 words
- No quotation marks
- Do not use phrases like "Conversation about"
- Return only the title
`;

    let title: string;

    if (provider === 'openai') {
      title = await this.openAIProvider.chat(prompt);
    } else if (provider === 'gemini') {
      title = await this.geminiProvider.chat(prompt);
    } else if (provider === 'openrouter') {
      title = await this.openRouterProvider.chat(prompt);
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    return title.trim();
  }

  private async prepareConversation(
    provider: string,
    message: string,
    user: any,
    conversationId?: string,
  ) {
    let conversation: Conversation;

    let history: { role: string; content: string }[] = [];

    if (conversationId) {
      const existingConversation = await this.conversationRepository.findOne({
        where: {
          id: conversationId,
          user: {
            id: user.id,
          },
        },
      });

      if (!existingConversation) {
        throw new NotFoundException('Conversation not found');
      }

      conversation = existingConversation;

      conversation.updatedAt = new Date();

      await this.conversationRepository.save(conversation);

      const previousMessages = await this.messageRepository.find({
        where: {
          conversation: {
            id: conversation.id,
          },
        },
        order: {
          createdAt: 'ASC',
        },
      });

      history = previousMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));
    } else {
      const title = await this.generateConversationTitle(provider, message);

      conversation = this.conversationRepository.create({
        title,
        user,
      });

      await this.conversationRepository.save(conversation);
    }

    const userMessage = this.messageRepository.create({
      role: MessageRole.USER,
      content: message,
      conversation,
    });

    await this.messageRepository.save(userMessage);

    return {
      conversation,
      history,
    };
  }

  async chat(
    provider: string,
    message: string,
    user: any,
    conversationId?: string,
  ) {
    const { conversation, history } = await this.prepareConversation(
      provider,
      message,
      user,
      conversationId,
    );

    let response: string;

    if (provider === 'openai') {
      response = await this.openAIProvider.chat(message, history);
    } else if (provider === 'gemini') {
      response = await this.geminiProvider.chat(message, history);
    } else if (provider === 'openrouter') {
      response = await this.openRouterProvider.chat(message, history);
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    const assistantMessage = this.messageRepository.create({
      role: MessageRole.ASSISTANT,
      content: response,
      conversation,
    });

    await this.messageRepository.save(assistantMessage);

    return {
      conversationId: conversation.id,
      response,
    };
  }

  async regenerate(provider: string, messageId: string, user: any) {
    const message = await this.conversationsService.findMessageByUser(
      messageId,
      String(user.id),
    );

    if (message.role !== MessageRole.USER) {
      throw new NotFoundException('Only user messages can be regenerated');
    }

    const previousMessages = await this.messageRepository.find({
      where: {
        conversation: {
          id: message.conversation.id,
        },
      },
      order: {
        createdAt: 'ASC',
      },
    });

    const history = previousMessages
      .filter((msg) => msg.createdAt < message.createdAt)
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

    let response: string;

    if (provider === 'openai') {
      response = await this.openAIProvider.chat(message.content, history);
    } else if (provider === 'gemini') {
      response = await this.geminiProvider.chat(message.content, history);
    } else if (provider === 'openrouter') {
      response = await this.openRouterProvider.chat(message.content, history);
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    const assistantMessage = await this.messageRepository.findOne({
      where: {
        conversation: {
          id: message.conversation.id,
        },
        role: MessageRole.ASSISTANT,

        createdAt: MoreThan(message.createdAt),
      },
      order: {
        createdAt: 'ASC',
      },
    });

    if (!assistantMessage) {
      throw new NotFoundException('Assistant response not found');
    }

    assistantMessage.content = response;

    await this.messageRepository.save(assistantMessage);

    return {
      conversationId: message.conversation.id,
      response,
    };
  }

  async editMessage(
    provider: string,
    messageId: string,
    content: string,
    user: any,
  ) {
    const message = await this.conversationsService.findMessageByUser(
      messageId,
      String(user.id),
    );

    if (message.role !== MessageRole.USER) {
      throw new NotFoundException('Only user messages can be edited');
    }

    const previousMessages = await this.messageRepository.find({
      where: {
        conversation: {
          id: message.conversation.id,
        },
      },
      order: {
        createdAt: 'ASC',
      },
    });

    const history = previousMessages
      .filter((msg) => msg.createdAt < message.createdAt)
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

    await this.conversationsService.deleteMessagesAfter(
      messageId,
      String(user.id),
    );

    message.content = content;

    await this.messageRepository.save(message);

    let response: string;

    if (provider === 'openai') {
      response = await this.openAIProvider.chat(content, history);
    } else if (provider === 'gemini') {
      response = await this.geminiProvider.chat(content, history);
    } else if (provider === 'openrouter') {
      response = await this.openRouterProvider.chat(content, history);
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    const assistantMessage = this.messageRepository.create({
      role: MessageRole.ASSISTANT,
      content: response,
      conversation: message.conversation,
    });

    await this.messageRepository.save(assistantMessage);

    return {
      conversationId: message.conversation.id,
      response,
    };
  }

  async *streamChat(
    provider: string,
    message: string,
    user: any,
    conversationId?: string,
    signal?: AbortSignal,
  ): AsyncGenerator<{
    type: 'chunk' | 'done';
    content?: string;
    conversationId?: string;
  }> {
    const { conversation, history } = await this.prepareConversation(
      provider,
      message,
      user,
      conversationId,
    );

    let stream: AsyncGenerator<string>;

    if (provider === 'openai') {
      stream = this.openAIProvider.streamChat(message, history, signal);
    } else if (provider === 'gemini') {
      stream = this.geminiProvider.streamChat(message, history);
    } else if (provider === 'openrouter') {
      stream = this.openRouterProvider.streamChat(message, history, signal);
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    let fullResponse = '';

    try {
      for await (const chunk of stream) {
        fullResponse += chunk;

        yield {
          type: 'chunk',
          content: chunk,
        };
      }
    } catch (error) {
      if (signal?.aborted) {
        return; // Exit gracefully if the request was aborted
      }

      throw error; // Rethrow other errors
    }

    const assistantMessage = this.messageRepository.create({
      role: MessageRole.ASSISTANT,
      content: fullResponse,
      conversation,
    });

    await this.messageRepository.save(assistantMessage);

    yield {
      type: 'done',
      conversationId: conversation.id,
    };
  }
}
