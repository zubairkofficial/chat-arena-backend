import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Patch,
  Delete,
  HttpStatus,
  Req,
  UseGuards,
  Put,
} from '@nestjs/common';
import { ArenaService } from './arena.service';
import { ArenaDtos } from './dto/arena.dto';
import { Arena } from './entities/arena.entity';
import { handleServiceError } from '../errors/error-handling';
import { CommonDTOs } from '../common/dto';
import { AuthGuard } from '../middleware/auth.middleware';

@Controller('arenas')
export class ArenaController {
  constructor(private readonly arenaService: ArenaService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createArena(
    @Body() input: ArenaDtos.CreateArenaDto,
    @Req() req,
  ): Promise<Arena> {
    const user = req.user as CommonDTOs.CurrentUser; // Extract user from request
    return await this.arenaService.createArena(input, user);
  }
  @Post('join-arena')
  @UseGuards(AuthGuard)
  async joinArena(
    @Body() input: ArenaDtos.JoinArenaDto,
    @Req() req,
  ): Promise<Arena> {
    const user = req.user as CommonDTOs.CurrentUser; 
    return await this.arenaService.joinArena(input, user);
  }

  @Get(':id')
  async getArenaById(@Param('id') id: string): Promise<Arena> {
    try {
      return await this.arenaService.getArenaById(id);
    } catch (error) {
      handleServiceError(error, HttpStatus.NOT_FOUND, 'Arena not found');
    }
  }

  @Get()
  async getAllArenas(): Promise<Arena[]> {
    try {
      return await this.arenaService.getAllArenas();
    } catch (error) {
      handleServiceError(
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve arenas',
      );
    }
  }

  @Put(':id')
  async updateArena(
    @Param('id') id: string,
    @Body() updateArenaDto: ArenaDtos.UpdateArenaDto,
  ): Promise<Arena> {
    try {
      return await this.arenaService.updateArena(id, updateArenaDto);
    } catch (error) {
      handleServiceError(
        error,
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
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to delete arena',
      );
    }
  }
}
