import {
  Controller,
  Get,
  Req,
  Param,
  Patch,
  UseGuards,
  Body,
  Query,
  Delete,
} from '@nestjs/common';

import { ApiBearerAuth } from '@nestjs/swagger';

import { ConversationsService } from './conversation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Req() req: { user: { id: string } },
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.conversationsService.findAllByUser(
      req.user.id,
      parseInt(page),
      parseInt(limit),
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id/messages')
  async findMessages(
    @Req() req: { user: { id: string } },
    @Param('id') id: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.conversationsService.findMessages(
      id,
      req.user.id,
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('search')
  async search(
    @Req() req: { user: { id: string } },
    @Query('q') search: string,
  ) {
    return this.conversationsService.searchConversations(req.user.id, search);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Req() req: { user: { id: string } }, @Param('id') id: string) {
    return this.conversationsService.findOne(id, req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateMessage(
    @Req() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() updateConversationDto: UpdateConversationDto,
  ) {
    return this.conversationsService.updateTitle(
      id,
      req.user.id,
      updateConversationDto,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id/pin')
  async togglePin(
    @Req() req: { user: { id: string } },
    @Param('id') id: string,
  ) {
    return this.conversationsService.togglePin(id, req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id/archived')
  async toggleArchived(
    @Req() req: { user: { id: string } },
    @Param('id') id: string,
  ) {
    return this.conversationsService.toggleArchived(id, req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('messages/:messageId')
  async deleteMessage(
    @Req() req: { user: { id: string } },
    @Param('messageId') messageId: string,
  ) {
    return this.conversationsService.deleteMessageByUser(
      messageId,
      req.user.id,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteConversation(
    @Req() req: { user: { id: string } },
    @Param('id') id: string,
  ) {
    return this.conversationsService.deleteConversation(id, req.user.id);
  }
}
