import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpenAIProvider } from './providers/openai.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenRouterProvider } from './providers/openrouter.provider';
import { ConversationsModule } from '../conversations/conversations.module';
import { Conversation } from '../conversations/entities/conversion.entity';
import { Message } from '../conversations/entities/message.entity';

@Module({
  imports: [
    ConfigModule,
    ConversationsModule,
    TypeOrmModule.forFeature([Conversation, Message]),
  ],
  controllers: [AiController],
  providers: [OpenAIProvider, GeminiProvider, OpenRouterProvider, AiService],
})
export class AiModule {}
