import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { Conversation } from './entities/conversion.entity';
import { Message, MessageRole } from './entities/message.entity';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,

    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async findAllByUser(userId: string, page: number, limit: number) {
    const [conversations, total] =
      await this.conversationRepository.findAndCount({
        where: {
          user: {
            id: userId,
          },
        },
        order: {
          updatedAt: 'DESC',
        },
        skip: (page - 1) * limit,
        take: limit,
      });

    return {
      conversations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
  async findOne(id: string, userId: string): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: {
        id,
        user: {
          id: userId,
        },
      },
      relations: {
        messages: true,
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  async findMessages(
    conversationId: string,
    userId: string,
    page: number,
    limit: number,
  ) {
    const conversation = await this.conversationRepository.findOne({
      where: {
        id: conversationId,
        user: {
          id: userId,
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const [messages, total] = await this.messageRepository.findAndCount({
      where: {
        conversation: {
          id: conversationId,
        },
      },
      order: {
        createdAt: 'ASC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      messages,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findMessageByUser(messageId: string, userId: string) {
    const message = await this.messageRepository.findOne({
      where: {
        id: messageId,
        conversation: {
          user: {
            id: userId,
          },
        },
      },
      relations: {
        conversation: true,
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return message;
  }

  async searchConversations(userId: string, search: string) {
    return this.conversationRepository.find({
      where: {
        user: {
          id: userId,
        },
        title: ILike(`%${search}%`),
      },
      order: {
        updatedAt: 'DESC',
      },
    });
  }

  async togglePin(id: string, userId: string) {
    const conversation = await this.findOne(id, userId);

    conversation.isPinned = !conversation.isPinned;

    return this.conversationRepository.save(conversation);
  }

  async toggleArchived(id: string, userId: string) {
    const conversation = await this.findOne(id, userId);

    conversation.isArchived = !conversation.isArchived;

    return this.conversationRepository.save(conversation);
  }

  async updateMessageByUser(
    messageId: string,
    userId: string,
    content: string,
  ) {
    const message = await this.findMessageByUser(messageId, userId);

    if (message.role !== MessageRole.USER) {
      throw new NotFoundException('Only user messages can be edited');
    }

    message.content = content;
    // message.conversation.title = content;

    return this.messageRepository.save(message);
  }

  async updateTitle(
    id: string,
    userId: string,
    updateConversationDto: UpdateConversationDto,
  ): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: {
        id,
        user: {
          id: userId,
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    Object.assign(conversation, updateConversationDto);
    return this.conversationRepository.save(conversation);
  }

  async deleteMessageByUser(messageId: string, userId: string): Promise<void> {
    const message = await this.findMessageByUser(messageId, userId);

    await this.messageRepository.remove(message);
  }

  async deleteMessagesAfter(messageId: string, userId: string) {
    const message = await this.findMessageByUser(messageId, userId);

    await this.messageRepository
      .createQueryBuilder()
      .delete()
      .from(Message)
      .where('conversationId = :conversationId', {
        conversationId: message.conversation.id,
      })
      .andWhere('"createdAt" > :createdAt', {
        createdAt: message.createdAt,
      })
      .execute();
  }

  async deleteConversation(id: string, userId: string): Promise<void> {
    const conversation = await this.findOne(id, userId);

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    await this.conversationRepository.remove(conversation);
  }
}
