import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { SystemPromptService } from './system-prompt.service';

import { handleServiceError } from '../errors/error-handling';
import { SystemPromptDto } from './dto/system-prompt.dto';

@Controller('system-prompt')
export class SystemPromptController {
  constructor(private readonly systemPromptService: SystemPromptService) {}

  // Create one or multiple SystemPrompts
  @Post()
  async createSystemPrompt(
    @Body()
    createSystemPromptDto:SystemPromptDto.CreateSystemPromptDto,
    
  ) {
    try {
      if (Array.isArray(createSystemPromptDto)) {
        // Handle multiple creation
        return await this.systemPromptService.createManySystemPrompts(
          createSystemPromptDto,
        );
      }
      // Handle single creation
      return await this.systemPromptService.createSystemPrompt(createSystemPromptDto);
    } catch (error) {
      handleServiceError(
        error,
        HttpStatus.BAD_REQUEST,
        'Failed to create system prompt(s)',
      );
    }
  }

  // Get all SystemPrompts
  @Get()
  async getAllSystemPrompts() {
    try {
      return await this.systemPromptService.getAllSystemPrompts();
    } catch (error) {
      handleServiceError(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve system prompts',
      );
    }
  }

  // Get a specific SystemPrompt by ID
  @Get(':id')
  async getSystemPromptById(@Param('id') id: string) {
    try {
      return await this.systemPromptService.getSystemPromptById(id);
    } catch (error) {
      handleServiceError(error, HttpStatus.NOT_FOUND, 'System prompt not found');
    }
  }

  // Update a specific SystemPrompt by ID
  @Put(':id')
  async updateSystemPrompt(
    @Param('id') id: string,
    @Body() updateSystemPromptDto: SystemPromptDto.UpdateSystemPromptDto,
  ) {
    try {
      return await this.systemPromptService.updateSystemPrompt(
        id,
        updateSystemPromptDto,
      );
    } catch (error) {
      handleServiceError(
        error,
        HttpStatus.BAD_REQUEST,
        'Failed to update system prompt',
      );
    }
  }

  // Delete a specific SystemPrompt by ID
  @Delete(':id')
  async deleteSystemPrompt(@Param('id') id: string) {
    try {
      return await this.systemPromptService.deleteSystemPrompt(id);
    } catch (error) {
      handleServiceError(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to delete system prompt',
      );
    }
  }
}
