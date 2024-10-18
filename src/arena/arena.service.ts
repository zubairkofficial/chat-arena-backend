import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ArenaRepository } from './arena.repository';
import { ArenaDtos } from './dto/arena.dto';
import { Arena } from './entities/arena.entity';
import { BaseService } from '../base/base.service';
import { ArenaTypeRepository } from 'src/arena-type/arena-type.repository';
import { AIFigureRepository } from 'src/aifigure/aifigure.repository';
import { DataSource, EntityManager } from 'typeorm';
import { CommonDTOs } from 'src/common/dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ArenaService extends BaseService {
  constructor(
    private readonly arenaRepository: ArenaRepository,
    private readonly aiFigureRepository: AIFigureRepository,
    private readonly arenaTypeRepository: ArenaTypeRepository, dataSource: DataSource,
    private readonly entityManager: EntityManager,
    private readonly userService: UserService,

  ) {
    super(dataSource);
  }

  // Create an Arena
  // async createArena(input: ArenaDtos.CreateArenaDto): Promise<Arena> {
  //   // Validate ArenaType
  //   const arenaType = await this.arenaTypeRepository.findOneById( input.arenaTypeId);
  //   if (!arenaType) {
  //     throw new BadRequestException(`ArenaType with ID ${input.arenaTypeId} does not exist`);
  //   }
  
  //   // Validate AIFigure
  //   const aiFigure = await this.aiFigureRepository.findOneBy({ id: input.aiFigureId });
  //   if (!aiFigure) {
  //     throw new BadRequestException(`AIFigure with ID ${input.aiFigureId} does not exist`);
  //   }
  
  //   // Create and save the Arena
  //   const newArena = this.arenaRepository.create({
  //     name: input.name,
  //     description: input.description,
  //     expiryTime: input.expiryTime,
  //     maxParticipants: input.maxParticipants,
  //     status: input.status,
  //     arenaType: arenaType,
  //     aiFigures: aiFigure,
  //   });
  
  //   return await this.arenaRepository.save(newArena);
  // }
  
  async createArena(input: ArenaDtos.CreateArenaDto, user: CommonDTOs.CurrentUser): Promise<Arena> {
    const transactionScope = this.getTransactionScope();
    const arena=new Arena()
    const existUser=await this.userService.getUserById(user.id)
    if(!existUser) throw new NotFoundException('Invalid user specified')
    // Validate ArenaType
    const arenaType = await this.arenaTypeRepository.findOneById(input.arenaTypeId);
    if (!arenaType) {
      throw new BadRequestException(`ArenaType with ID ${input.arenaTypeId} does not exist`);
    }

    // Validate AIFigure
    const aiFigure = await this.aiFigureRepository.findOneBy({ id: input.aiFigureId });
    if (!aiFigure) {
      throw new BadRequestException(`AIFigure with ID ${input.aiFigureId} does not exist`);
    }

    // Create the Arena object
    arena.name = input.name;
    arena.description = input.description;
    arena.expiryTime = input.expiryTime;
    arena.maxParticipants = input.maxParticipants;
    arena.status = input.status;
    arena.arenaType = arenaType;
    arena.aiFigures = aiFigure;
    arena.createdBy = existUser;  // Set the createdBy field to the user who is creating the a
   
    transactionScope.add(arena);
    await transactionScope.commit(this.entityManager); // Use entityManager for transaction
    return arena;
  }  

  // Get Arena by ID
  async getArenaById(id: string): Promise<Arena> {
    // Retrieve arena with its relations
    const arena = await this.arenaRepository.findOne({
      where: { id },
      relations: ['arenaType', 'aiFigures', 'userArenas', 'conversations'],
    });

    if (!arena) {
      throw new NotFoundException(`Arena with ID ${id} not found`);
    }

    return arena;
  }

  // Get all Arenas
  async getAllArenas(): Promise<Arena[]> {
    return await this.arenaRepository.find({
      relations: ['arenaType', 'aiFigures', 'userArenas', 'conversations'],
    });
  }

  // Update Arena details
  async updateArena(id: string, input: ArenaDtos.UpdateArenaDto): Promise<Arena> {
    const arena = await this.getArenaById(id);

    // Validate ArenaType if it has been provided for an update
    if (input.arenaTypeId && input.arenaTypeId !== arena.arenaType.id) {
      const arenaType = await this.arenaTypeRepository.findOneById( input.arenaTypeId);
      if (!arenaType) {
        throw new BadRequestException(`ArenaType with ID ${input.arenaTypeId} does not exist`);
      }
      arena.arenaType = arenaType;
    }

    // Validate AIFigure if it has been provided for an update
    if (input.aiFigureId && input.aiFigureId !== arena.aiFigures.id) {
      const aiFigure = await this.aiFigureRepository.findOne({ where: { id: input.aiFigureId } });
      if (!aiFigure) {
        throw new BadRequestException(`AIFigure with ID ${input.aiFigureId} does not exist`);
      }
      arena.aiFigures = aiFigure;
    }

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
