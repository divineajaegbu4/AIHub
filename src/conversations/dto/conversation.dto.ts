import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConversationDto {
  @ApiProperty({ example: 'openai' })
  @IsString()
  @IsNotEmpty()
  provider!: string;

  @ApiProperty({ example: 'What is your name?', minLength: 300 })
  @IsString()
  @IsNotEmpty()
  @MinLength(300)
  message!: string;
}
