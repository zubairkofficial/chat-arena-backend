import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ArenaTypeRepository } from './arena-type.repository';
import { ArenaTypeDto } from './dto/arena-type.dto';
import { ArenaType } from './entities/arena-type.entity';
import { BaseService } from '../base/base.service';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class ArenaTypeService extends BaseService {
  constructor(
    private readonly arenaTypeRepository: ArenaTypeRepository,
    dataSource: DataSource,
    private readonly entityManager: EntityManager,
  ) {
    super(dataSource);
  }

  // Utility function to handle service errors
  private handleServiceError(error: any, defaultMessage: string): void {
    if (
      error instanceof BadRequestException ||
      error instanceof NotFoundException
    ) {
      throw error; // Rethrow known exceptions
    } else {
      throw new InternalServerErrorException(defaultMessage);
    }
  }

  // Create a new ArenaType
  async createArenaType(
    input: ArenaTypeDto.CreateArenaTypeDto,
  ): Promise<ArenaType> {
    const transactionScope = this.getTransactionScope();
    const arenaType = new ArenaType();

    arenaType.description = input.description;
    arenaType.name = input.name;
    arenaType.prompt = input.prompt;

    try {
      transactionScope.add(arenaType);
      await transactionScope.commit(this.entityManager); // Use entityManager for transaction
      return arenaType;
    } catch (error) {
      this.handleServiceError(error, 'Failed to create arena type');
    }
  }

  // Create multiple ArenaTypes
  async createManyArenaTypes(
    createArenaTypeDtos: ArenaTypeDto.CreateArenaTypeDto[],
  ): Promise<ArenaType[]> {
    const transactionScope = this.getTransactionScope();

    const arenaTypes = await Promise.all(
      createArenaTypeDtos.map((dto) => {
        const arenaType = new ArenaType();
        arenaType.description = dto.description;
        arenaType.name = dto.name;
        arenaType.prompt = dto.prompt;

        transactionScope.add(arenaType); // Add each arenaType to the transaction
        return arenaType;
      }),
    );

    try {
      await transactionScope.commit(this.entityManager); // Commit all at once
      return arenaTypes;
    } catch (error) {
      this.handleServiceError(error, 'Failed to create multiple arena types');
    }
  }

  // Get all ArenaTypes
  async getAllArenaTypes(): Promise<ArenaType[]> {
    try {
      return await this.arenaTypeRepository.findAll();
    } catch (error) {
      this.handleServiceError(error, 'Failed to retrieve arena types');
    }
  }

  // Get a specific ArenaType by ID
  async getArenaTypeById(id: string): Promise<ArenaType> {
    try {
      const arenaType = await this.arenaTypeRepository.findOneById(id);
      if (!arenaType) {
        throw new NotFoundException(`ArenaType with ID ${id} not found.`);
      }
      return arenaType;
    } catch (error) {
      this.handleServiceError(error, `Failed to find arena type with ID ${id}`);
    }
  }

  // Update an existing ArenaType
  async updateArenaType(
    id: string,
    updateArenaTypeDto: ArenaTypeDto.UpdateArenaTypeDto,
  ): Promise<ArenaType> {
    const transactionScope = this.getTransactionScope();
    const arenaType = await this.getArenaTypeById(id); // Ensure the arena type exists

    // Update fields
    arenaType.name = updateArenaTypeDto.name || arenaType.name;
    arenaType.description =
      updateArenaTypeDto.description || arenaType.description;
    arenaType.prompt = updateArenaTypeDto.prompt || arenaType.prompt;

    try {
      transactionScope.update(arenaType); // Use update method in the transaction scope
      await transactionScope.commit(this.entityManager); // Commit changes
      return arenaType;
    } catch (error) {
      this.handleServiceError(error, 'Failed to update arena type');
    }
  }

  // Delete an ArenaType
  async deleteArenaType(id: string): Promise<void> {
    const transactionScope = this.getTransactionScope();
    const arenaType = await this.getArenaTypeById(id); // Ensure the arena type exists

    try {
      transactionScope.delete(arenaType); // Use delete method in the transaction scope
      await transactionScope.commit(this.entityManager); // Commit deletion
    } catch (error) {
      this.handleServiceError(error, 'Failed to delete arena type');
    }
  }
}
