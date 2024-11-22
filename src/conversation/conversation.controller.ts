import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpStatus,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { handleServiceError } from '../errors/error-handling';
import { ConversationDto } from './dto/conversation.dto';

@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  // Create one or multiple Conversations
  @Post('create')
  async createConversation(
    @Body() createConversationDto: ConversationDto.CreateConversationDto | ConversationDto.CreateConversationDto[],
  ) {
    try {
      if (Array.isArray(createConversationDto)) {
        // Handle multiple creation
        return await this.conversationService.createManyConversations(createConversationDto);
      }
      // Handle single creation
      return await this.conversationService.createConversation(createConversationDto);
    } catch (error) {
      handleServiceError(error.errorLogService, HttpStatus.BAD_REQUEST, 'Failed to create conversation(s)');
    }
  }

  // Get all Conversations
  @Get('all')
  async getAllConversations() {
    try {
      return await this.conversationService.getAllConversations();
    } catch (error) {
      handleServiceError(error.errorLogService, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve conversations');
    }
  }

  // Get a specific Conversation by ID
  @Get(':id')
  async getConversationById(@Param('id') id: string) {
    try {
      return await this.conversationService.getConversationById(id);
    } catch (error) {
      handleServiceError(error.errorLogService, HttpStatus.NOT_FOUND, 'Conversation not found');
    }
  }

  // Update a specific Conversation by ID
  @Put(':id')
  async updateConversation(
    @Param('id') id: string,
    @Body() updateConversationDto: ConversationDto.UpdateConversationDto,
  ) {
    try {
      return await this.conversationService.updateConversation(id, updateConversationDto);
    } catch (error) {
      handleServiceError(error.errorLogService, HttpStatus.BAD_REQUEST, 'Failed to update conversation');
    }
  }

  // Delete a specific Conversation by ID
  @Delete(':id') // Simplified the endpoint
  async deleteConversation(@Param('id') id: string) {
    try {
      return await this.conversationService.deleteConversation(id);
    } catch (error) {
      handleServiceError(error.errorLogService, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete conversation');
    }
  }
}
