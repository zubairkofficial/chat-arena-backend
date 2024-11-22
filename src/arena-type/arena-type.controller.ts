import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { ArenaTypeService } from './arena-type.service';
import { ArenaTypeDto } from './dto/arena-type.dto';
import { handleServiceError } from '../errors/error-handling';

@Controller('arena-types')
export class ArenaTypeController {
  constructor(private readonly arenaTypeService: ArenaTypeService) {}

  // Create one or multiple ArenaTypes
  @Post('create')
  async createArenaType(
    @Body()
    createArenaTypeDto:
      | ArenaTypeDto.CreateArenaTypeDto
      | ArenaTypeDto.CreateArenaTypeDto[],
  ) {
    try {
      if (Array.isArray(createArenaTypeDto)) {
        // Handle multiple creation
        return await this.arenaTypeService.createManyArenaTypes(
          createArenaTypeDto,
        );
      }
      // Handle single creation
      return await this.arenaTypeService.createArenaType(createArenaTypeDto);
    } catch (error) {
      handleServiceError(
        error,
        HttpStatus.BAD_REQUEST,
        'Failed to create arena type(s)',
      );
    }
  }

  // Get all ArenaTypes
  @Get('all')
  async getAllArenaTypes() {
    try {
      return await this.arenaTypeService.getAllArenaTypes();
    } catch (error) {
      handleServiceError(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve arena types',
      );
    }
  }

  // Get a specific ArenaType by ID
  @Get(':id')
  async getArenaTypeById(@Param('id') id: string) {
    try {
      return await this.arenaTypeService.getArenaTypeById(id);
    } catch (error) {
      handleServiceError(error.errorLogService, HttpStatus.NOT_FOUND, 'Arena type not found');
    }
  }

  // Update a specific ArenaType by ID
  @Put(':id')
  async updateArenaType(
    @Param('id') id: string,
    @Body() updateArenaTypeDto: ArenaTypeDto.UpdateArenaTypeDto,
  ) {
    try {
      return await this.arenaTypeService.updateArenaType(
        id,
        updateArenaTypeDto,
      );
    } catch (error) {
      handleServiceError(
        error,
        HttpStatus.BAD_REQUEST,
        'Failed to update arena type',
      );
    }
  }

  // Delete a specific ArenaType by ID
  @Delete('/delete/:id')
  async deleteArenaType(@Param('id') id: string) {
    try {
      return await this.arenaTypeService.deleteArenaType(id);
    } catch (error) {
      handleServiceError(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to delete arena type',
      );
    }
  }
}
