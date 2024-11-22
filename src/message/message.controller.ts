import {
  Controller,
  Post,
  Get,
  Param,
  Put,
  Delete,
  Body,
  HttpStatus,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageDto } from './dto/message.dto';
import { handleServiceError } from '../errors/error-handling';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async create(@Body() createMessageDto: MessageDto.CreateMessageDto) {
    try {
      return await this.messageService.createMessage(createMessageDto);
    } catch (error) {
      throw handleServiceError(error.errorLogService, HttpStatus.BAD_REQUEST, 'Failed to create message');
    }
  }

  @Get('conversation/:conversationId')
  async getMessages(@Param('conversationId') conversationId: string) {
    try {
      return await this.messageService.getMessagesByConversationId(conversationId);
    } catch (error) {
      throw handleServiceError(error.errorLogService, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve messages');
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMessageDto: MessageDto.UpdateMessageDto,
  ) {
    try {
      return await this.messageService.updateMessage(id, updateMessageDto);
    } catch (error) {
      throw handleServiceError(error.errorLogService, HttpStatus.BAD_REQUEST, 'Failed to update message');
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      await this.messageService.deleteMessage(id);
      return { message: 'Message deleted successfully' }; // Optional: return a success message
    } catch (error) {
      throw handleServiceError(error.errorLogService, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete message');
    }
  }
}
