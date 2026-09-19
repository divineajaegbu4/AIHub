// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import Cerebras from '@cerebras/cerebras_cloud_sdk';
// import { AiProvider } from './ai-provider.interface';

// @Injectable()
// export class CerebrasProvider implements AiProvider {
//   private readonly cerebras: Cerebras;

//   constructor(private readonly configService: ConfigService) {
//     this.cerebras = new Cerebras({
//       apiKey: this.configService.get<string>('CEREBRAS_API_KEY'),
//     });
//   }

//   async chat(message: string): Promise<string> {
//     const response = await this.cerebras.chat.completions.create({
//       model: 'gpt-oss-120b',

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

//     if (!('choices' in response)) {
//       throw new Error('Cerebras returned an error response');
//     }

//     const choice = response.choices?.[0];

//     return choice && 'message' in choice
//       ? (choice.message?.content?.toString() ?? '')
//       : '';
//   }
// }
