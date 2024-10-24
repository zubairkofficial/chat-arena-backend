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
import { UserArenaService } from '../user-arena/user-arena.service';
import { ArenaAIFigure } from '../arena-ai-figure/entities/arena-ai-figure.entity';

@Injectable()
export class ArenaService extends BaseService {
  constructor(
    private readonly arenaRepository: ArenaRepository,
    private readonly aiFigureRepository: AIFigureRepository,
    private readonly arenaTypeRepository: ArenaTypeRepository,
    private readonly userArenaService: UserArenaService,
    dataSource: DataSource,
    private readonly entityManager: EntityManager,
    private readonly userService: UserService,
   
  ) {
    super(dataSource);
  }

  async createArena(
    input: ArenaDtos.CreateArenaDto,
    user: CommonDTOs.CurrentUser,
  ): Promise<Arena> {
    const transactionScope = this.getTransactionScope();
    const existUser = await this.userService.getUserById(user.id);
    if (!existUser) throw new NotFoundException('Invalid user specified');
  
    // Validate ArenaType
    const arenaType = await this.arenaTypeRepository.findOneById(
      input.arenaTypeId,
    );
    if (!arenaType) {
      throw new BadRequestException(
        `ArenaType with ID ${input.arenaTypeId} does not exist`,
      );
    }
  
    // Validate AIFigures
    const aiFigures = await this.aiFigureRepository.find({
      where: { id: In(input.aiFigureId) },
    });
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

  
    // Add the arena to the transaction scope
    transactionScope.add(arena);
  
    // Commit the transaction to save the arena and obtain its ID
  
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
  }

  async joinArena(
    input: ArenaDtos.JoinArenaDto,
    user: CommonDTOs.CurrentUser,
  ): Promise<Arena> {
    const existUser = await this.userService.getUserById(user.id);
    if (!existUser) throw new NotFoundException('Invalid user specified');
    // Validate ArenaType
    const arena = await this.getArenaById(input.arenaId);
    if (!arena) {
      throw new BadRequestException(
        `Arena with ID ${input.arenaId} does not exist`,
      );
    }
    const getArenaUsers = await this.getUsersByArenaId(input.arenaId);
    const numberOfUsers = getArenaUsers.userArenas.length;

    if (arena.maxParticipants <= numberOfUsers) {
      throw new BadRequestException(
        `Cannot join Arena ${arena.name}. Maximum participants reached`,
      );
    }
    await this.userArenaService.createUserArena(arena, existUser);
    const userArenaList = await this.arenaRepository
      .getUserArenaList(input.arenaId)
      .getOne();
    // Validate AIFigure
    return userArenaList;
  }

  async getUsersByArenaId(arenaId: string): Promise<Arena> {
    try {
      return this.arenaRepository.getArenaByIdAndJoin(arenaId).getOne();
    } catch (error) {
      throw new Error(`${error.message}`);
    }
  }

  // Get Arena by ID
  async getArenaById(id: string): Promise<Arena> {
    // Retrieve arena with its relations
    const arena = await this.arenaRepository.findOne({
      where: { id },
      relations: ['arenaType', 'arenaAIFigures', 'userArenas', 'conversations'],
    });

    if (!arena) {
      throw new NotFoundException(`Arena with ID ${id} not found`);
    }

    return arena;
  }

  // Get all Arenas
  async getAllArenas(): Promise<Arena[]> {
    return await this.arenaRepository.find({
      relations: ['arenaType',"arenaAIFigures", 'userArenas','createdBy'],
    });
  }

  // Update Arena details
  async updateArena(
    id: string,
    input: ArenaDtos.UpdateArenaDto,
  ): Promise<Arena> {
    const arena = await this.getArenaById(id);

    // Validate ArenaType if it has been provided for an update
    if (input.arenaTypeId && input.arenaTypeId !== arena.arenaType.id) {
      const arenaType = await this.arenaTypeRepository.findOneById(
        input.arenaTypeId,
      );
      if (!arenaType) {
        throw new BadRequestException(
          `ArenaType with ID ${input.arenaTypeId} does not exist`,
        );
      }
      arena.arenaType = arenaType;
    }

    // Validate AIFigure if it has been provided for an update
    // if (input.aiFigureId && input.aiFigureId !== arena.aiFigures.id) {
    //   const aiFigure = await this.aiFigureRepository.findOne({
    //     where: { id: input.aiFigureId },
    //   });
    //   if (!aiFigure) {
    //     throw new BadRequestException(
    //       `AIFigure with ID ${input.aiFigureId} does not exist`,
    //     );
    //   }
    //   arena.aiFigures = aiFigure;
    // }

    // Assign the rest of the fields
    Object.assign(arena, input);

    return await this.arenaRepository.save(arena);
  }

  // Delete Arena
  async deleteArena(id: string): Promise<{ message: string }> {
    const arena = await this.getArenaById(id);

    if (!arena) throw new NotFoundException(`Arena with ID ${id} not found`);

    await this.arenaRepository.remove(arena);

    return { message: 'Arena deleted successfully' };
  }
}
