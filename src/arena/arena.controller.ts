import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Delete,
  HttpStatus,
  Req,
  UseGuards,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ArenaService } from './arena.service';
import { ArenaDtos } from './dto/arena.dto';
import { Arena } from './entities/arena.entity';
import { handleServiceError } from '../errors/error-handling';
import { CommonDTOs } from '../common/dto';
import { AuthGuard } from '../middleware/auth.middleware';
import { FileInterceptor } from '@nestjs/platform-express';
import { storageConfig } from '../utils/file-upload.utils';

@Controller('arenas')
export class ArenaController {
  constructor(private readonly arenaService: ArenaService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: storageConfig('./uploads'), // Specify the uploads directory
    }),
  )
  async createArena(
    @Body() input: ArenaDtos.CreateArenaDto,
    @UploadedFile() file,
    @Req() req,
  ): Promise<Arena> {
    try {
      const user = req.user as CommonDTOs.CurrentUser; // Extract user from request
      return await this.arenaService.createArena(file, input, user);
    } catch (error) {
      handleServiceError(
        error.errorLogService,
        HttpStatus.NOT_FOUND,
        'Arena not found',
      );
    }
  }

  @Post('join-arena')
  @UseGuards(AuthGuard)
  async joinArena(
    @Body() input: ArenaDtos.JoinArenaDto,
    @Req() req,
  ): Promise<Arena> {
    try {
      const user = req.user as CommonDTOs.CurrentUser;
      return await this.arenaService.joinArena(input.arenaId, user.id);
    } catch (error) {
      handleServiceError(
        error.errorLogService,
        HttpStatus.NOT_FOUND,
        'Arena not found',
      );
    }
  }

  @Get(':id')
  async getArenaById(@Param('id') id: string): Promise<Arena> {
    try {
      return await this.arenaService.getArenaById(id);
    } catch (error) {
      handleServiceError(
        error.errorLogService,
        HttpStatus.NOT_FOUND,
        'Arena not found',
      );
    }
  }

  @Get()
  @UseGuards(AuthGuard)
  async getAllArenas(@Req() req): Promise<Arena[]> {
    try {
      const user = req.user as CommonDTOs.CurrentUser;
      return await this.arenaService.getAllArenas(user);
    } catch (error) {
      handleServiceError(
        error.errorLogService,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve arenas',
      );
    }
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: storageConfig('./uploads'), // Specify the uploads directory for file storage
    }),
  )
  async updateArena(
    @Param('id') id: string,
    @Body() updateArenaDto: ArenaDtos.UpdateArenaDto,
    @UploadedFile() file, // If you have a file
  ): Promise<Arena> {
    try {
      const dataToUpdate = { ...updateArenaDto, file };
      return await this.arenaService.updateArena(id,file, dataToUpdate);
    } catch (error) {
      handleServiceError(
        error.errorLogService,
        HttpStatus.BAD_REQUEST,
        'Failed to update arena',
      );
    }
  }

  @Delete(':id')
  async deleteArena(@Param('id') id: string): Promise<{ message: string }> {
    try {
      return await this.arenaService.deleteArena(id);
    } catch (error) {
      handleServiceError(
        error.errorLogService,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to delete arena',
      );
    }
  }
}
