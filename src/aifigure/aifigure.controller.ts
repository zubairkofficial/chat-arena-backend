import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
  Put,
} from '@nestjs/common';
import { AIFigureDtos } from './dto/aifigure.dto';
import { AIFigure } from './entities/aifigure.entity';
import { AIFigureService } from './aifigure.service';
import { handleServiceError } from '../errors/error-handling';
import { FileInterceptor } from '@nestjs/platform-express';
import { storageConfig } from '../utils/file-upload.utils';
import { CommonDTOs } from '../common/dto';
import { AuthGuard } from '../middleware/auth.middleware';
import { UserAifigureMessage } from '../user-aifigure-message/entities/user-aifigure-message.entity';

@Controller('ai-figures')
export class AIFigureController {
  constructor(private readonly aiFigureService: AIFigureService) {}

  // Create a new AIFigure
  @Post()
  @UseInterceptors(FileInterceptor('file', {
      storage: storageConfig('./uploads'), // Specify the uploads directory
    }))
  async createAIFigure(
    @Body() createAIFigureDto: AIFigureDtos.CreateAIFigureDto,
    @UploadedFile() file,
  ): Promise<AIFigure> {
    try {
      return await this.aiFigureService.createAIFigure(file,createAIFigureDto);
    } catch (error) {
      handleServiceError(
        error.errorLogService,
        HttpStatus.BAD_REQUEST,
        'Failed to create AI figure',
      );
    }
  }


  @Post('chat/:figureId')
  @UseGuards(AuthGuard)
  async aiFigureMessage(
    @Req() req,
    @Param('figureId') figureId: string,
    @Body() input: AIFigureDtos.MessageDto,
  ): Promise<string> {
    try {

      const currentUser = req.user as CommonDTOs.CurrentUser;

      return await this.aiFigureService.aiFigureMessage(figureId,input.message,currentUser);
    } catch (error) {
      handleServiceError(
        error.errorLogService,
        HttpStatus.BAD_REQUEST,
        'Failed to create AI figure',
      );
    }
  }
  @Get('previous-chat/:figureId')
  @UseGuards(AuthGuard)
  async getAiFigureMessage(
    @Req() req,
    @Param('figureId') figureId: string,
    @Body() input: AIFigureDtos.MessageDto,
  ): Promise<UserAifigureMessage[]> {
    try {

      const currentUser = req.user as CommonDTOs.CurrentUser;

      return await this.aiFigureService.getAiFigureMessage(figureId,currentUser);
    } catch (error) {
      handleServiceError(
        error.errorLogService,
        HttpStatus.BAD_REQUEST,
        'Failed to create AI figure',
      );
    }
  }

  // Get all AIFigures
  @Get()
  @UseGuards(AuthGuard)
  async getAllAIFigures(  @Req() req,): Promise<AIFigure[]> {
    
    try {
      const currentUser = req.user as CommonDTOs.CurrentUser;

      return await this.aiFigureService.getAllAIFigures(currentUser);
    } catch (error) {
      handleServiceError(
        error.errorLogService,
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
      handleServiceError(error.errorLogService, HttpStatus.NOT_FOUND, 'AI figure not found');
    }
  }

  // Update AIFigure by ID
  @Put(':id')
  @UseInterceptors(FileInterceptor('file', {
    storage: storageConfig('./uploads'), // Specify the uploads directory
  }))// Intercept the file upload
  async updateAIFigure(
    @Param('id') id: string,
    @Body() updateAIFigureDto: AIFigureDtos.UpdateAIFigureDto, // The remaining fields will be handled in the DTO
    @UploadedFile() file
    // The file will be parsed and accessible here
  ) {
    try {
      // Here you can use the 'file' and 'updateAIFigureDto' to update the figure
      return await this.aiFigureService.updateAIFigure(id, updateAIFigureDto, file);
    } catch (error) {
      handleServiceError(error.errorLogService, HttpStatus.BAD_REQUEST, 'Failed to update AI figure');
    }
  }


  // Delete AIFigure by ID
  @Delete(':id')
  async deleteAIFigure(@Param('id') id: string): Promise<{ message: string }> {
    try {
      return await this.aiFigureService.deleteAIFigure(id);
    } catch (error) {
      handleServiceError(
        error.errorLogService,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to delete AI figure',
      );
    }
  }
}
