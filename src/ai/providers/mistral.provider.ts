// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { Mistral } from '@mistralai/mistralai';
// import { AiProvider } from './ai-provider.interface';

// @Injectable()
// export class MistralProvider implements AiProvider {
//   private readonly mistral: Mistral;

//   constructor(private readonly configService: ConfigService) {
//     this.mistral = new Mistral({
//       apiKey: this.configService.get<string>('MISTRAL_API_KEY'),
//     });
//   }

//   async chat(message: string): Promise<string> {
//     const response = await this.mistral.chat.complete({
//       model: 'mistral-small-latest',
//       messages: [
//         {
//           role: 'system',
//           content: `
//             You are AIHub Assistant, an AI assistant created for the AIHub platform.

//             Your job is to help users with:
//             - Programming
//             - Learning
//             - Problem-solving
//             - General questions
//             - Everyday tasks

//             Always give clear, helpful, and accurate answers.
//             When explaining difficult concepts, explain them in simple language.

//             If the user asks "What is your name?", "Who are you?",
//             or "Introduce yourself", respond:

//             "I'm AIHub Assistant, an AI assistant created for the AIHub platform.
//             I'm powered by AI services and designed to help you with questions,
//             ideas, information, problem-solving, learning, and everyday tasks."
//           `,
//         },
//         {
//           role: 'user',
//           content: message,
//         },
//       ],
//     });

//     return response.choices[0]?.message?.content?.toString() ?? '';
//   }
// }
