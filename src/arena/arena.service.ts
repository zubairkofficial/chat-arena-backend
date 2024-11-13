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
import { FigureRoleService } from '../figure-role/figure-role.service';
import { AIFigureService } from '../aifigure/aifigure.service';
import { BASE_URL } from '../common/constants';
import { ArenaRequestStatus } from '../common/enums';

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
    private readonly figureRoleService: FigureRoleService,
    private readonly aiFigureService: AIFigureService,
  ) {
    super(dataSource);
  }

  async createArena(
    file,
    input: ArenaDtos.CreateArenaDto,
    user: CommonDTOs.CurrentUser,
  ): Promise<Arena> {
    const transactionScope = this.getTransactionScope();
    
    try {
      // Set the image URL if a file is provided
      if (file) {
        const baseUrl = this.configService.get('BACK_END_BASE_URL') || BASE_URL;
        input.image = `${baseUrl}/uploads/${file.filename}`;
      }
  
      // Validate the user
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
      Object.assign(arena, {
        name: input.name,
        description: input.description,
        expiryTime: input.expiryTime == 'null' ? null : input.expiryTime,
        maxParticipants: Number(input.maxParticipants),
        status: input.status || 'open',
        arenaType,
        createdBy: existUser,
        image: input.image,
      });
      existUser.createArenaRequestStatus=ArenaRequestStatus.STATUS
      // Add the arena to the transaction scope
      transactionScope.update(existUser)
      transactionScope.add(arena);
  
      // Create ArenaAIFigure entries
      const arenaAIFiguresPromises = Object.entries(input.aiFigureRoles).map(async ([aiFigureId, figureRoleId]) => {
        // Fetch the figure role and AI figure based on the IDs
        const figureRole = await this.figureRoleService.figureRoleById(figureRoleId);
        const aiFigure = await this.aiFigureService.getAIFigureById(aiFigureId);
      
        // Create the ArenaAIFigure instance
        const arenaAiFigure = new ArenaAIFigure();
        arenaAiFigure.arena = arena;
        arenaAiFigure.aiFigure = aiFigure;
        arenaAiFigure.figureRole = figureRole;
      
        return arenaAiFigure;
      });
      
  
      const arenaAIFigures = await Promise.all(arenaAIFiguresPromises);
  
      // Add ArenaAIFigure entries to the transaction scope
      transactionScope.addCollection(arenaAIFigures);
      
      
      // Commit the transaction
      await transactionScope.commit(this.entityManager);
  
      return arena;
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }
  

  async joinArena(
    arenaId:string,
    userId: string,
  ): Promise<Arena> {
    try {
      const existUser = await this.userService.getUserById(userId);
      if (!existUser) throw new NotFoundException('Invalid user specified');

      // Validate Arena
      const arena = await this.getArenaById(arenaId);
      if (!arena) throw new BadRequestException(`Arena with ID ${arenaId} does not exist`);

      const getArenaUsers = await this.getUsersByArenaId(arenaId);
      const numberOfUsers = getArenaUsers.userArenas.length;

      if (arena.maxParticipants!==0 && arena.maxParticipants < numberOfUsers) {
        throw new BadRequestException(`Cannot join Arena ${arena.name}. Maximum participants reached`);
      }

      // Logic to add user to arena...

      const userArenaList = await this.arenaRepository.getUserArenaList(arenaId).getOne();
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
        relations: ['arenaType', 'arenaAIFigures', 'userArenas'],
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

  async deleteArena(arenaId: string): Promise<{ message: string }> {
    try {


      const transactionScop=this.getTransactionScope()
    
      const arena= await this.getUsersByArenaId(arenaId)

      transactionScop.deleteCollection(arena.userArenas)
      transactionScop.delete(arena)
      await transactionScop.commit(this.entityManager)


      // const arena = await this.getArenaById(id);
      // await this.arenaRepository.remove(arena);
      return { message: 'Arena deleted successfully' };
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }
}
