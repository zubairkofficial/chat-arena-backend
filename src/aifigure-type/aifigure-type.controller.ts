import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AifigureTypeService } from './aifigure-type.service';
import { AifigureTypeDto } from './dto/aifigure-type.dto';
import { handleServiceError } from '../errors/error-handling';
import { AuthGuard } from  '../middleware/auth.middleware';

@Controller('aifigure-types')
export class AifigureTypeController {
  constructor(private readonly aifigureTypeService: AifigureTypeService) {}

  // Create one or multiple AifigureTypes
  @Post('')
   @UseGuards(AuthGuard)
  async createAifigureType(
    @Body()
    createAifigureTypeDto:
      | AifigureTypeDto.CreateAifigureTypeDto
      | AifigureTypeDto.CreateAifigureTypeDto[],
  ) {
    try {
      if (Array.isArray(createAifigureTypeDto)) {
        // Handle multiple creation
        return await this.aifigureTypeService.createManyAifigureTypes(
          createAifigureTypeDto,
        );
      }
      // Handle single creation
      return await this.aifigureTypeService.createAifigureType(createAifigureTypeDto);
    } catch (error) {
      handleServiceError(
        error.errorLogService   ,
        HttpStatus.BAD_REQUEST,
        'Failed to create AI figure type(s)',
      );
    }
  }

  // Get all AifigureTypes
  @Get('')
   @UseGuards(AuthGuard)
  async getAllAifigureTypes() {
    try {
      return await this.aifigureTypeService.getAllAifigureTypes();
    } catch (error) {
      handleServiceError(
        error.errorLogService  ,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve AI figure types',
      );
    }
  }

  // Get a specific AifigureType by ID
  @Get(':id')
  async getAifigureTypeById(@Param('id') id: string) {
    try {
      return await this.aifigureTypeService.getAifigureTypeById(id);
    } catch (error) {
      handleServiceError(
        error.errorLogService  ,
        HttpStatus.NOT_FOUND,
        'AI figure type not found',
      );
    }
  }

  // Update a specific AifigureType by ID
  @Put(':id')
   @UseGuards(AuthGuard)
  async updateAifigureType(
    @Param('id') id: string,
    @Body() updateAifigureTypeDto: AifigureTypeDto.UpdateAifigureTypeDto,
  ) {
    try {
      return await this.aifigureTypeService.updateAifigureType(
        id,
        updateAifigureTypeDto,
      );
    } catch (error) {
      handleServiceError(
        error.errorLogService  ,
        HttpStatus.BAD_REQUEST,
        'Failed to update AI figure type',
      );
    }
  }

  // Delete a specific AifigureType by ID
  @Delete(':id')
   @UseGuards(AuthGuard)
  async deleteAifigureType(@Param('id') id: string) {
    try {
      return await this.aifigureTypeService.deleteAifigureType(id);
    } catch (error) {
      handleServiceError(
        error.errorLogService  ,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to delete AI figure type',
      );
    }
  }
}
