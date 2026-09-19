import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateConversationDto {
  @ApiProperty({ example: 'What is your name?' })
  @IsString()
  @IsNotEmpty()
  title!: string;
}
