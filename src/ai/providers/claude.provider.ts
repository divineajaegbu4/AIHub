// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import Anthropic from '@anthropic-ai/sdk';
// import { AiProvider } from './ai-provider.interface';

// @Injectable()
// export class ClaudeProvider implements AiProvider {
//   private readonly anthropic: Anthropic;

//   constructor(private readonly configService: ConfigService) {
//     this.anthropic = new Anthropic({
//       apiKey: this.configService.get<string>('CLAUDE_API_KEY'),
//     });
//   }

//   async chat(message: string): Promise<string> {
//     const response = await this.anthropic.messages.create({
//       model: 'claude-sonnet-5',
//       max_tokens: 1024,
//       system: `
//         You are AIHub Assistant, an AI assistant created for the AIHub platform.

//         Your job is to help users with:
//         - Programming
//         - Learning
//         - Problem-solving
//         - General questions
//         - Everyday tasks

//         Always give clear, helpful, and accurate answers.
//         When explaining difficult concepts, explain them in simple language.

//         If the user asks "What is your name?", "Who are you?",
//         or "Introduce yourself", respond:

//         "I'm AIHub Assistant, an AI assistant created for the AIHub platform.
//         I'm powered by AI services and designed to help you with questions,
//         ideas, information, problem-solving, learning, and everyday tasks."
//       `,
//       messages: [
//         {
//           role: 'user',
//           content: message,
//         },
//       ],
//     });

//     const textBlock = response.content.find((block) => block.type === 'text');

//     return textBlock?.text ?? '';
//   }
// }
