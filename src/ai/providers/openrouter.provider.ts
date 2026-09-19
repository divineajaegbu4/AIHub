import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenRouter } from '@openrouter/sdk';
import { AiProvider } from './ai-provider.interface';

@Injectable()
export class OpenRouterProvider implements AiProvider {
  private readonly openrouter: OpenRouter;

  constructor(private readonly configService: ConfigService) {
    this.openrouter = new OpenRouter({
      apiKey: this.configService.get<string>('OPENROUTER_API_KEY'),
    });
  }

  private buildMessages(
    message: string,
    history?: { role: string; content: string }[],
  ) {
    return [
      ...(history ?? []).map((msg) => ({
        role: msg.role.toLowerCase() as 'user' | 'assistant',
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content: message,
      },
    ];
  }

  async chat(
    message: string,
    history?: { role: string; content: string }[],
  ): Promise<string> {
    const messages = this.buildMessages(message, history);

    const response = await this.openrouter.chat.send({
      chatRequest: {
        model: 'openrouter/free',

        messages: [
          {
            role: 'system',
            content: `
            You are AIHub Assistant, an AI assistant created for the AIHub platform.

            Your job is to help users with:
            - Programming
            - Learning
            - Problem-solving
            - General questions
            - Everyday tasks

            Always give clear, helpful, and accurate answers.
            When explaining difficult concepts, explain it in simple language.
          `,
          },
          ...messages,
        ],
      },
    });

    if (response instanceof ReadableStream) {
      throw new Error('Expected a non-streaming response');
    }

    return response.choices[0]?.message?.content?.toString() ?? '';
  }

  async *streamChat(
    message: string,
    history?: { role: string; content: string }[],
    signal?: AbortSignal,
  ): AsyncGenerator<string> {
    const messages = this.buildMessages(message, history);

    const stream = (await this.openrouter.chat.send(
      {
        chatRequest: {
          model: 'openrouter/free',

          messages: [
            {
              role: 'system',
              content: `
            You are AIHub Assistant, an AI assistant created for the AIHub platform.

            Your job is to help users with:
            - Programming
            - Learning
            - Problem-solving
            - General questions
            - Everyday tasks

            Always give clear, helpful, and accurate answers.
            When explaining difficult concepts, explain it in simple language.
          `,
            },
            ...messages,
          ],

          stream: true,
        },
      },
      { signal },
    )) as unknown as AsyncIterable<{
      choices: Array<{
        delta?: {
          content?: string | null;
        };
      }>;
    }>;

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;

      if (text) {
        yield text;
      }
    }
  }
}
