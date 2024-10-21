import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ArenaType } from './entities/arena-type.entity';

@Injectable()
export class ArenaTypeRepository extends Repository<ArenaType> {
  constructor(private readonly dataSource: DataSource) {
    super(ArenaType, dataSource.createEntityManager());
  }

  // Create a new ArenaType
  async createArenaType(
    createArenaTypeDto: Partial<ArenaType>,
  ): Promise<ArenaType> {
    const newArenaType = this.create(createArenaTypeDto);
    try {
      return await this.save(newArenaType);
    } catch (error) {
      throw new BadRequestException('Failed to create ArenaType.');
    }
  }

  // Find all ArenaTypes
  async findAll(): Promise<ArenaType[]> {
    try {
      return await this.find();
    } catch (error) {
      throw new BadRequestException('Failed to fetch ArenaTypes.');
    }
  }

  // Find ArenaType by ID
  async findOneById(id: string): Promise<ArenaType> {
    const arenaType = await this.findOne({ where: { id } });
    if (!arenaType) {
      throw new NotFoundException(`ArenaType with ID ${id} not found.`);
    }
    return arenaType;
  }

  // Update an existing ArenaType
  async updateArenaType(
    id: string,
    updateArenaTypeDto: Partial<ArenaType>,
  ): Promise<ArenaType> {
    const existingArenaType = await this.findOneById(id); // Ensure the ArenaType exists
    Object.assign(existingArenaType, updateArenaTypeDto);
    try {
      return await this.save(existingArenaType);
    } catch (error) {
      throw new BadRequestException('Failed to update ArenaType.');
    }
  }

  // Remove an ArenaType
  async deleteArenaType(id: string): Promise<void> {
    const arenaType = await this.findOneById(id); // Ensure the ArenaType exists
    try {
      await this.remove(arenaType);
    } catch (error) {
      throw new BadRequestException(
        `Failed to delete ArenaType with ID ${id}.`,
      );
    }
  }
}
