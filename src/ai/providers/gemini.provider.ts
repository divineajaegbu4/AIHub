import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { AiProvider } from './ai-provider.interface';

@Injectable()
export class GeminiProvider implements AiProvider {
  private readonly gemini: GoogleGenAI;

  constructor(private readonly configService: ConfigService) {
    this.gemini = new GoogleGenAI({
      apiKey: this.configService.get<string>('GEMINI_API_KEY'),
    });
  }

  async chat(
    message: string,
    history?: { role: string; content: string }[],
  ): Promise<string> {
    const response = await this.gemini.interactions.create({
      model: 'gemini-3.8-flash',
      // input: message,
      input: [
        ...(history ?? []).map((msg) => ({
          type: 'user_input' as const,
          content: [
            {
              type: 'text' as const,
              text: msg.content,
            },
          ],
        })),
        {
          type: 'user_input' as const,
          content: [
            {
              type: 'text' as const,
              text: message,
            },
          ],
        },
      ],
      system_instruction: `
      You are AIHub Assistant, an AI assistant created for the AIHub platform.

      Your job is to help users with:
      - Programming
      - Learning
      - Problem-solving
      - General questions
      - Everyday tasks

      Always give clear, helpful, and accurate answers.
      When explaining difficult concepts, explain them in simple language.

      If the user asks "What is your name?", "Who are you?",
      or "Introduce yourself", respond:

      "I'm AIHub Assistant, an AI assistant created for the AIHub platform.
      I'm powered by AI services and designed to help you with questions,
      ideas, information, problem-solving, learning, and everyday tasks."
    `,
    });

    return response.output_text ?? '';
  }

  async *streamChat(
    message: string,
    history?: { role: string; content: string }[],
  ): AsyncGenerator<string> {
    const stream = await this.gemini.interactions.create({
      model: 'gemini-3.8-flash',
      input: [
        ...(history ?? []).map((msg) => ({
          type:
            msg.role.toLowerCase() === 'assistant'
              ? ('model_output' as const)
              : ('user_input' as const),
          content: [
            {
              type: 'text' as const,
              text: msg.content,
            },
          ],
        })),
        {
          type: 'user_input' as const,
          content: [
            {
              type: 'text' as const,
              text: message,
            },
          ],
        },
      ],
      stream: true,
    });

    for await (const event of stream) {
      if (event.event_type === 'step.delta' && event.delta.type === 'text') {
        yield event.delta.text;
      }
    }
  }
}
