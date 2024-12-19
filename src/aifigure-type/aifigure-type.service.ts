import {
  Injectable,
  NotFoundException,
  
} from '@nestjs/common';
import { AifigureTypeRepository } from './aiFigureTypeRepository';
import { AifigureType } from './entities/aifigure-type.entity';
import { BaseService } from '../base/base.service';
import { DataSource, EntityManager } from 'typeorm';
import { AllExceptionsFilter } from '../errors/http-exception.filter'; // Adjust path as necessary
import { AifigureTypeDto } from './dto/aifigure-type.dto';

@Injectable()
export class AifigureTypeService extends BaseService {
  constructor(
    private readonly aifigureTypeRepository: AifigureTypeRepository,
    dataSource: DataSource,
    private readonly entityManager: EntityManager,
  ) {
    super(dataSource);
  }

  // Create a single AifigureType
  async createAifigureType(
    input: AifigureTypeDto.CreateAifigureTypeDto,
  ): Promise<AifigureType> {
    const transactionScope = this.getTransactionScope();
    const aifigureType = new AifigureType();

    aifigureType.name = input.name;
    aifigureType.description = input.description;

    try {
      transactionScope.add(aifigureType);
      await transactionScope.commit(this.entityManager); // Use entityManager for transaction
      return aifigureType;
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  // Create multiple AifigureTypes
  async createManyAifigureTypes(
    createAifigureTypeDtos: AifigureTypeDto.CreateAifigureTypeDto[],
  ): Promise<AifigureType[]> {
    const transactionScope = this.getTransactionScope();

    const aifigureTypes = await Promise.all(
      createAifigureTypeDtos.map((dto) => {
        const aifigureType = new AifigureType();
        aifigureType.name = dto.name;
        aifigureType.description = dto.description;

        transactionScope.add(aifigureType);
        return aifigureType;
      }),
    );

    try {
      await transactionScope.commit(this.entityManager); // Commit all changes
      return aifigureTypes;
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  // Get all AifigureTypes
  async getAllAifigureTypes(): Promise<AifigureType[]> {
    try {
      return await this.aifigureTypeRepository.find();
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  // Get a specific AifigureType by ID
  async getAifigureTypeById(id: string): Promise<AifigureType> {
    try {
      const aifigureType = await this.aifigureTypeRepository.findOne({
        where: { id },
      });
      if (!aifigureType) {
        throw new NotFoundException(`AifigureType with ID ${id} not found.`);
      }
      return aifigureType;
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  // Update an existing AifigureType
  async updateAifigureType(
    id: string,
    updateAifigureTypeDto: AifigureTypeDto.UpdateAifigureTypeDto,
  ): Promise<AifigureType> {
    const transactionScope = this.getTransactionScope();
    const aifigureType = await this.getAifigureTypeById(id); // Ensure the AifigureType exists

    // Update fields
    aifigureType.name = updateAifigureTypeDto.name || aifigureType.name;
    aifigureType.description =
      updateAifigureTypeDto.description || aifigureType.description;

    try {
      transactionScope.update(aifigureType);
      await transactionScope.commit(this.entityManager); // Commit changes
      return aifigureType;
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  // Delete an AifigureType
  async deleteAifigureType(id: string): Promise<void> {
    const transactionScope = this.getTransactionScope();
    const aifigureType = await this.getAifigureTypeById(id); // Ensure the AifigureType exists

    try {
      transactionScope.delete(aifigureType);
      await transactionScope.commit(this.entityManager); // Commit deletion
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }
}
