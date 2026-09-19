import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Conversation } from './entities/conversion.entity';
import { Message } from './entities/message.entity';

import { ConversationsService } from './conversation.service';
import { ConversationsController } from './conversation.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, Message])],
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [ConversationsService],
})
export class ConversationsModule {}
