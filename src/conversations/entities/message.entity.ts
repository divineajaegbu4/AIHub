import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Conversation } from './conversion.entity';

export enum MessageRole {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
}

@Entity({ name: 'messages' })
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: MessageRole,
  })
  role!: MessageRole;

  @Column({ type: 'text' })
  content!: string;

  @ManyToOne(
    () => Conversation,
    (conversation: Conversation) => conversation.messages,
    {
      onDelete: 'CASCADE',
    },
  )
  conversation!: Conversation;

  @CreateDateColumn()
  createdAt!: Date;
}
