import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  HttpStatus,
} from '@nestjs/common';
import { AIFigureDtos } from './dto/aifigure.dto';
import { AIFigure } from './entities/aifigure.entity';
import { AIFigureService } from './aifigure.service';
import { handleServiceError } from '../errors/error-handling';

@Controller('ai-figures')
export class AIFigureController {
  constructor(private readonly aiFigureService: AIFigureService) {}

  // Create a new AIFigure
  @Post()
  async createAIFigure(
    @Body() createAIFigureDto: AIFigureDtos.CreateAIFigureDto,
  ): Promise<AIFigure> {
    try {
      return await this.aiFigureService.createAIFigure(createAIFigureDto);
    } catch (error) {
      handleServiceError(
        error,
        HttpStatus.BAD_REQUEST,
        'Failed to create AI figure',
      );
    }
  }

  // Get all AIFigures
  @Get()
  async getAllAIFigures(): Promise<AIFigure[]> {
    try {
      return await this.aiFigureService.getAllAIFigures();
    } catch (error) {
      handleServiceError(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve AI figures',
      );
    }
  }

  // Get AIFigure by ID
  @Get(':id')
  async getAIFigureById(@Param('id') id: string): Promise<AIFigure> {
    try {
      return await this.aiFigureService.getAIFigureById(id);
    } catch (error) {
      handleServiceError(error, HttpStatus.NOT_FOUND, 'AI figure not found');
    }
  }

  // Update AIFigure by ID
  @Patch(':id')
  async updateAIFigure(
    @Param('id') id: string,
    @Body() updateAIFigureDto: AIFigureDtos.UpdateAIFigureDto,
  ): Promise<AIFigure> {
    try {
      return await this.aiFigureService.updateAIFigure(id, updateAIFigureDto);
    } catch (error) {
      handleServiceError(
        error,
        HttpStatus.BAD_REQUEST,
        'Failed to update AI figure',
      );
    }
  }

  // Delete AIFigure by ID
  @Delete(':id')
  async deleteAIFigure(@Param('id') id: string): Promise<{ message: string }> {
    try {
      return await this.aiFigureService.deleteAIFigure(id);
    } catch (error) {
      handleServiceError(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to delete AI figure',
      );
    }
  }
}
