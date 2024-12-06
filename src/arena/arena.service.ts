import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
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
    let parsedArenaModel = [];

    const transactionScope = this.getTransactionScope();

    try {
      // Validate input
      if (!input || Object.keys(input).length === 0) {
        throw new BadRequestException('Input data is required');
      }

      // Set the image URL if a file is provided
      if (file) {
        const baseUrl = this.configService.get('BACK_END_BASE_URL') || BASE_URL;
        input.image = `${baseUrl}/uploads/${file.filename}`;
      }
      if (input.arenaModel && typeof input.arenaModel === 'string') {
        input.arenaModel = JSON.parse(input.arenaModel); // Parse it to an array
      }

      // Validate the user
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

      // Validate roles in aiFigureRoles
      for (const roleId of Object.values(input.aiFigureRoles)) {
        const isValidRole = await this.figureRoleService.figureRoleById(roleId);
        if (!isValidRole) {
          throw new BadRequestException(
            `FigureRole with ID ${roleId} does not exist`,
          );
        }
      }

      parsedArenaModel.forEach((model) => {
        if (!model.value || !model.label) {
          throw new BadRequestException(
            'Each arenaModel item must have "value" and "label" properties.',
          );
        }
      });
      // Process and format arenaModel
      const formattedArenaModel = parsedArenaModel.map((model) => ({
        value: model.value,
        label: model.label,
      }));

      // Create the Arena object
      const arena = new Arena();
      Object.assign(arena, {
        name: input.name,
        description: input.description,
        expiryTime: input.expiryTime === 'null' ? null : input.expiryTime,
        maxParticipants: Number(input.maxParticipants),
        status: input.status || 'open',
        arenaType,
        createdBy: existUser,
        image: input.image,
        isPrivate: input.isPrivate ?? false,
        arenaModel: formattedArenaModel, // Save only UUIDs
      });

      // Update user's arena request status
      existUser.createArenaRequestStatus = ArenaRequestStatus.STATUS;

      // Add objects to the transaction scope
      transactionScope.update(existUser);
      transactionScope.add(arena);

      // Create ArenaAIFigure entries
      const arenaAIFiguresPromises = Object.entries(input.aiFigureRoles).map(
        async ([aiFigureId, figureRoleId]) => {
          const figureRole =
            await this.figureRoleService.figureRoleById(figureRoleId);
          const aiFigure =
            await this.aiFigureService.getAIFigureById(aiFigureId);

          const arenaAiFigure = new ArenaAIFigure();
          Object.assign(arenaAiFigure, {
            arena,
            aiFigure,
            figureRole,
          });

          return arenaAiFigure;
        },
      );

      const arenaAIFigures = await Promise.all(arenaAIFiguresPromises);

      // Add ArenaAIFigure entries to the transaction scope
      transactionScope.addCollection(arenaAIFigures);

      // Commit the transaction
      await transactionScope.commit(this.entityManager);

      return arena;
    } catch (error) {
      // Throw a more descriptive error
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'Failed to create arena',
          error.message,
        );
      }
    }
  }

  async joinArena(arenaId: string, userId: string): Promise<Arena> {
    try {
      const existUser = await this.userService.getUserById(userId);
      if (!existUser) throw new NotFoundException('Invalid user specified');

      // Validate Arena
      const arena = await this.getArenaById(arenaId);
      if (!arena)
        throw new BadRequestException(
          `Arena with ID ${arenaId} does not exist`,
        );

      const getArenaUsers = await this.getUsersByArenaId(arenaId);
      const numberOfUsers = getArenaUsers.userArenas.length;

      if (
        arena.maxParticipants !== 0 &&
        arena.maxParticipants < numberOfUsers
      ) {
        throw new BadRequestException(
          `Cannot join Arena ${arena.name}. Maximum participants reached`,
        );
      }

      // Logic to add user to arena...

      const userArenaList = await this.arenaRepository
        .getUserArenaList(arenaId)
        .getOne();
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
        relations: [
          'arenaType',
          'arenaAIFigures',
          'arenaAIFigures.aiFigure',
          'arenaAIFigures.figureRole',
          'userArenas',
        ],
      });

      if (!arena) {
        throw new NotFoundException(`Arena with ID ${id} not found`);
      }

      return arena;
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  async getAllArenas(user?: CommonDTOs.CurrentUser): Promise<Arena[]> {
    try {
      return await this.arenaRepository.getAllArenas(user).getMany();
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }
  
  async getCountArenas(): Promise<number> {
    try {
      return await this.arenaRepository.count();
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  async updateArena(
    id: string,
    file,
    input: ArenaDtos.UpdateArenaDto,
  ): Promise<Arena> {
    try {
      let arenaAIFigures;
      const transactionScope = this.getTransactionScope();
  
      // Step 1: Fetch the arena with relations
      const arena = await this.getArenaById(id);
      if (!arena) {
        throw new BadRequestException(`Arena with ID ${id} does not exist`);
      }
  
      if (file) {
        const baseUrl = this.configService.get('BACK_END_BASE_URL') || BASE_URL;
        input.image = `${baseUrl}/uploads/${file.filename}`;
      }
  
      // Step 2: Handle arenaType update if provided
      if (input.arenaTypeId && input.arenaTypeId !== arena.arenaType.id) {
        const arenaType = await this.arenaTypeRepository.findOneById(input.arenaTypeId);
        if (!arenaType) {
          throw new BadRequestException(`ArenaType with ID ${input.arenaTypeId} does not exist`);
        }
        arena.arenaType = arenaType;
      }
  
      // Step 3: Handle AI Figures if provided
      if (input.aiFigureId) {
        // Validate AI Figures
        const aiFigures = await this.aiFigureRepository.find({
          where: { id: In(input.aiFigureId) },
        });
        if (aiFigures.length !== input.aiFigureId.length) {
          throw new BadRequestException('Some AIFigure IDs are invalid.');
        }
  
        // Remove existing ArenaAIFigures
        transactionScope.deleteCollection(arena.arenaAIFigures);
  
        // Create new ArenaAIFigure entries
        const arenaAIFiguresPromises = Object.entries(input.aiFigureRoles).map(
          async ([aiFigureId, figureRoleId]) => {
            // Validate the figure role
            const figureRole = await this.figureRoleService.figureRoleById(figureRoleId);
            if (!figureRole) {
              throw new BadRequestException(`FigureRole with ID ${figureRoleId} does not exist`);
            }
  
            // Get the AI figure by ID
            const aiFigure = await this.aiFigureService.getAIFigureById(aiFigureId);
            if (!aiFigure) {
              throw new BadRequestException(`AI Figure with ID ${aiFigureId} does not exist`);
            }
  
            // Create new ArenaAIFigure
            const arenaAiFigure = new ArenaAIFigure();
            arenaAiFigure.arena = arena;
            arenaAiFigure.aiFigure = aiFigure;
            arenaAiFigure.figureRole = figureRole;
  
            return arenaAiFigure;
          },
        );
  
        // Wait for all promises to resolve
        arenaAIFigures = await Promise.all(arenaAIFiguresPromises);
      }
  
      // Step 4: Handle arenaModel if provided
      let parsedArenaModel = [];
      if (input.arenaModel && typeof input.arenaModel === 'string') {
        parsedArenaModel = JSON.parse(input.arenaModel);
      } else {
        parsedArenaModel = input.arenaModel;
      }
  
      parsedArenaModel.forEach((model) => {
        if (!model.value || !model.label) {
          throw new BadRequestException('Each arenaModel item must have "value" and "label" properties.');
        }
      });
  
      // Step 5: Update basic arena properties
      Object.assign(arena, {
        name: input.name ?? arena.name,
        description: input.description ?? arena.description,
        expiryTime: input.expiryTime === 'null' ? null : input.expiryTime ?? arena.expiryTime,
        maxParticipants: input.maxParticipants ? Number(input.maxParticipants) : arena.maxParticipants,
        status: input.status ?? arena.status,
        image: input.image ?? arena.image,
        isPrivate: input.isPrivate ?? arena.isPrivate,
        arenaModel: parsedArenaModel,
      });
  
      // Step 6: Add arena to transaction scope and commit
      transactionScope.update(arena);
      transactionScope.addCollection(arenaAIFigures);
  
      await transactionScope.commit(this.entityManager);
  
      return arena;
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }
  

  async deleteArena(arenaId: string): Promise<{ message: string }> {
    try {
      const transactionScope = this.getTransactionScope();

      const arena = await this.getUsersByArenaId(arenaId);

      transactionScope.deleteCollection(arena.userArenas);
      transactionScope.delete(arena);
      await transactionScope.commit(this.entityManager);

      // const arena = await this.getArenaById(id);
      // await this.arenaRepository.remove(arena);
      return { message: 'Arena deleted successfully' };
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }
}
