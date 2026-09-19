import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { AiProvider } from './ai-provider.interface';

@Injectable()
export class OpenAIProvider implements AiProvider {
  private readonly openai: OpenAI;
  constructor(private readonly configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
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

  async chat(message: string, history?: { role: string; content: string }[]) {
    const response = await this.openai.responses.create({
      model: 'gpt-5.6-luna',
      instructions: `
      You are AIHub Assistant, an AI assistant created for the AIHub platform.
      You are powered by AI services.

      If the user asks "What is your name?", "Who are you?", or "Introduce yourself",
      respond with the following introduction:

      "I'm AIHub Assistant, an AI assistant created for the AIHub platform.
      I'm powered by AI services and designed to help you with questions, ideas,
      information, problem-solving, learning, and everyday tasks. I can understand
      your requests, provide useful answers, explain complex topics in simple terms,
      and assist you throughout your experience on AIHub."

      Do not shorten, summarize, or replace this introduction with only your name.
    `,
      // input: [
      //   ...(history ?? []).map((msg) => ({
      //     role: msg.role.toLowerCase() as 'user' | 'assistant',
      //     content: msg.content,
      //   })),
      //   {
      //     role: 'user' as const,
      //     content: message,
      //   },
      // ],

      input: this.buildMessages(message, history),
    });

    return response.output_text;
  }

  async *streamChat(
    message: string,
    history?: { role: string; content: string }[],
    signal?: AbortSignal,
  ): AsyncGenerator<string> {
    const stream = await this.openai.responses.create(
      {
        model: 'gpt-5.6-luna',

        instructions: `
    You are AIHub Assistant, an AI assistant created for the AIHub platform.
    You are powered by AI services and designed to help users with questions,
    ideas, information, problem-solving, learning, and everyday tasks.
    `,

        input: this.buildMessages(message, history),

        stream: true,
      },
      {
        signal,
      },
    );

    for await (const event of stream) {
      if (event.type === 'response.output_text.delta') {
        yield event.delta;
      }
    }
  }
}
