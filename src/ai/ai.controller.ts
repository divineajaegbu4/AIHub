import {
  Body,
  Controller,
  Post,
  Patch,
  Req,
  Res,
  Param,
  UseGuards,
} from '@nestjs/common';

import type { Response } from 'express';

import { ApiBearerAuth } from '@nestjs/swagger';

import { AiService } from './ai.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('chat')
  async chat(
    @Body()
    body: {
      provider: string;
      message: string;
      conversationId?: string;
    },
    @Req() req: any,
  ) {
    return this.aiService.chat(
      body.provider,
      body.message,
      req.user,
      body.conversationId,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('regenerate/:messageId')
  async regenerate(
    @Param('messageId') messageId: string,
    @Body() body: { provider: string },
    @Req() req: { user: { id: string } },
  ) {
    return this.aiService.regenerate(body.provider, messageId, req.user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('messages/:messageId')
  async editMessage(
    @Param('messageId') messageId: string,
    @Body()
    body: {
      provider: string;
      content: string;
    },
    @Req() req: { user: { id: string } },
  ) {
    return this.aiService.editMessage(
      body.provider,
      messageId,
      body.content,
      req.user,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('chat/stream')
  async streamChat(
    @Body()
    body: {
      provider: string;
      message: string;
      conversationId?: string;
    },
    @Req() req: any,
    @Res() res: Response,
  ) {
    const abortController = new AbortController();

    req.on('close', () => {
      abortController.abort();
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = this.aiService.streamChat(
      body.provider,
      body.message,
      req.user,
      body.conversationId,
    );

    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }

    res.end();
  }
}
