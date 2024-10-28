import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ArenaRepository } from './arena.repository';
import { ArenaDtos } from './dto/arena.dto';
import { Arena } from './entities/arena.entity';
import { BaseService } from '../base/base.service';
import { ArenaTypeRepository } from '../arena-type/arena-type.repository';
import { AIFigureRepository } from '../aifigure/aifigure.repository';
import { DataSource, EntityManager, In } from 'typeorm';
import { CommonDTOs } from '../common/dto';
import { UserService } from '../user/user.service';
import { ArenaAIFigure } from '../arena-ai-figure/entities/arena-ai-figure.entity';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from '../errors/http-exception.filter'; // Adjust the import as necessary

@Injectable()
export class ArenaService extends BaseService {
  constructor(
    private readonly arenaRepository: ArenaRepository,
    private readonly aiFigureRepository: AIFigureRepository,
    private readonly arenaTypeRepository: ArenaTypeRepository,
    dataSource: DataSource,
    private readonly entityManager: EntityManager,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    super(dataSource);
  }

  async createArena(
    file,
    input: ArenaDtos.CreateArenaDto,
    user: CommonDTOs.CurrentUser,
  ): Promise<Arena> {
    try {
      if (file) {
        const baseUrl = this.configService.get('BACK_END_BASE_URL') || 'http://localhost:8080';
        input.image = `${baseUrl}/uploads/${file.filename}`; // Set complete URL path
      }
      const transactionScope = this.getTransactionScope();
      const existUser = await this.userService.getUserById(user.id);
      if (!existUser) throw new NotFoundException('Invalid user specified');

      // Validate ArenaType
      const arenaType = await this.arenaTypeRepository.findOneById(input.arenaTypeId);
      if (!arenaType) {
        throw new BadRequestException(`ArenaType with ID ${input.arenaTypeId} does not exist`);
      }

      // Validate AIFigures
      const aiFigures = await this.aiFigureRepository.find({ where: { id: In(input.aiFigureId) } });
      if (aiFigures.length !== input.aiFigureId.length) {
        throw new BadRequestException('Some AIFigure IDs are invalid.');
      }

      // Create the Arena object
      const arena = new Arena();
      arena.name = input.name;
      arena.description = input.description;
      arena.expiryTime = input.expiryTime;
      arena.maxParticipants = input.maxParticipants;
      arena.status = input.status || 'open';
      arena.arenaType = arenaType;
      arena.createdBy = existUser;
      if (input.image) arena.image = input.image;

      // Add the arena to the transaction scope
      transactionScope.add(arena);

      // Create ArenaAIFigure entries
      const arenaAIFigures = aiFigures.map((aiFigure) => {
        const arenaAiFigure = new ArenaAIFigure();
        arenaAiFigure.arena = arena;
        arenaAiFigure.aiFigure = aiFigure;
        return arenaAiFigure;
      });

      // Save the ArenaAIFigure entries
      transactionScope.addCollection(arenaAIFigures);
      await transactionScope.commit(this.entityManager);

      return arena;
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  async joinArena(
    input: ArenaDtos.JoinArenaDto,
    user: CommonDTOs.CurrentUser,
  ): Promise<Arena> {
    try {
      const existUser = await this.userService.getUserById(user.id);
      if (!existUser) throw new NotFoundException('Invalid user specified');

      // Validate Arena
      const arena = await this.getArenaById(input.arenaId);
      if (!arena) throw new BadRequestException(`Arena with ID ${input.arenaId} does not exist`);

      const getArenaUsers = await this.getUsersByArenaId(input.arenaId);
      const numberOfUsers = getArenaUsers.userArenas.length;

      if (arena.maxParticipants <= numberOfUsers) {
        throw new BadRequestException(`Cannot join Arena ${arena.name}. Maximum participants reached`);
      }

      // Logic to add user to arena...

      const userArenaList = await this.arenaRepository.getUserArenaList(input.arenaId).getOne();
      return userArenaList;
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  async getUsersByArenaId(arenaId: string): Promise<Arena> {
    try {
      return await this.arenaRepository.getArenaByIdAndJoin(arenaId).getOne();
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  async getArenaWithAIFigure(arenaId: string): Promise<Arena> {
    try {
      return await this.arenaRepository.getArenaWithAIFigure(arenaId).getOne();
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  async getArenaById(id: string): Promise<Arena> {
    try {
      const arena = await this.arenaRepository.findOne({
        where: { id },
        relations: ['arenaType', 'arenaAIFigures', 'userArenas', 'conversations'],
      });

      if (!arena) {
        throw new NotFoundException(`Arena with ID ${id} not found`);
      }

      return arena;
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  async getAllArenas(): Promise<Arena[]> {
    try {
      return await this.arenaRepository.find({
        relations: ['arenaType', 'arenaAIFigures', 'userArenas', 'createdBy'],
      });
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  async updateArena(
    id: string,
    input: ArenaDtos.UpdateArenaDto,
  ): Promise<Arena> {
    try {
      const arena = await this.getArenaById(id);

      // Validate ArenaType if it has been provided for an update
      if (input.arenaTypeId && input.arenaTypeId !== arena.arenaType.id) {
        const arenaType = await this.arenaTypeRepository.findOneById(input.arenaTypeId);
        if (!arenaType) {
          throw new BadRequestException(`ArenaType with ID ${input.arenaTypeId} does not exist`);
        }
        arena.arenaType = arenaType;
      }

      Object.assign(arena, input);
      return await this.arenaRepository.save(arena);
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  async deleteArena(id: string): Promise<{ message: string }> {
    try {
      const arena = await this.getArenaById(id);
      await this.arenaRepository.remove(arena);
      return { message: 'Arena deleted successfully' };
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }
}
