import {
  Controller,
  Post,
  Get,
  Param,
  Put,
  Delete,
  Body,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageDto } from './dto/message.dto';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async create(@Body() createMessageDto: MessageDto.CreateMessageDto) {
    return await this.messageService.createMessage(createMessageDto);
  }

  @Get('conversation/:conversationId')
  async getMessages(@Param('conversationId') conversationId: string) {
    return await this.messageService.getMessagesByConversationId(conversationId);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateMessageDto: MessageDto.UpdateMessageDto) {
    return await this.messageService.updateMessage(id, updateMessageDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.messageService.deleteMessage(id);
  }
}
