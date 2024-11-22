import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Delete,
  HttpStatus,
  Put,
  Req,
} from '@nestjs/common';
import { handleServiceError } from '../errors/error-handling';
import { CommonDTOs } from '../common/dto';
import { AuthGuard } from '../middleware/auth.middleware';
import { UseGuards } from '@nestjs/common';
import { LlmModelService } from '../llm-model/llm-model.service';
import { LlmModelDtos } from '../llm-model/dto/llm-model.dto';

@Controller('llm-model')
export class LlmModelController {
  constructor(private readonly llmModelService: LlmModelService) {}

  // Create a new LLM model
  @Post()
  @UseGuards(AuthGuard)
  async createLlmModel(
    @Body() createLlmModelDto: LlmModelDtos.CreateLlmModelDto,
    @Req() req,
  ) {
    const user = req.user as CommonDTOs.CurrentUser; // Extract user from request
    try {
      return await this.llmModelService.createLLMModel(createLlmModelDto, user);
    } catch (error) {
      handleServiceError(error.errorLogService, HttpStatus.BAD_REQUEST, 'Failed to create LLM model');
    }
  }

  // Get all LLM models
  @Get()
  async getAllLlmModels() {
    try {
      return await this.llmModelService.findAll();
    } catch (error) {
      handleServiceError(error.errorLogService, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve LLM models');
    }
  }

  // Get a specific LLM model by ID
  @Get(':id')
  async getLlmModelById(@Param('id') id: string) {
    try {
      return await this.llmModelService.findOne(id);
    } catch (error) {
      handleServiceError(error.errorLogService, HttpStatus.NOT_FOUND, `LLM model with id ${id} not found`);
    }
  }

  // Update an existing LLM model by ID
  @Put(':id')
  async updateLlmModel(
    @Param('id') id: string,
    @Body() updateLlmModelDto: LlmModelDtos.UpdateLlmModelDto,
  ) {
    try {
      return await this.llmModelService.update(id, updateLlmModelDto);
    } catch (error) {
      handleServiceError(error.errorLogService, HttpStatus.BAD_REQUEST, 'Failed to update LLM model');
    }
  }

  // Delete an LLM model by ID
  @Delete(':id')
  async deleteLlmModel(@Param('id') id: string) {
    try {
      return await this.llmModelService.remove(id);
    } catch (error) {
      handleServiceError(error.errorLogService, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete LLM model');
    }
  }
}
