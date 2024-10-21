import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { AIFigureRepository } from './aifigure.repository';
import { AIFigureDtos } from './dto/aifigure.dto';
import { AIFigure } from './entities/aifigure.entity';
import { BaseService } from '../base/base.service';
import { DataSource } from 'typeorm';

@Injectable()
export class AIFigureService extends BaseService {
  constructor(
    private readonly aiFigureRepository: AIFigureRepository,
    dataSource: DataSource,
  ) {
    super(dataSource);
  }

  // Create a new AIFigure
  async createAIFigure(
    input: AIFigureDtos.CreateAIFigureDto,
  ): Promise<AIFigure> {
    // Ensure name and role are not empty (manual validation for additional checks)
    if (!input.name || !input.role) {
      throw new BadRequestException('Name and role are required fields.');
    }

    try {
      const newAIFigure = await this.aiFigureRepository.save(input);
      return newAIFigure;
    } catch (error) {
      throw new BadRequestException('Error occurred while creating AIFigure.');
    }
  }

  // Get all AIFigures
  async getAllAIFigures(): Promise<AIFigure[]> {
    try {
      return await this.aiFigureRepository.find();
    } catch (error) {
      throw new BadRequestException('Error fetching AIFigures.');
    }
  }

  // Get AIFigure by ID
  async getAIFigureById(id: string): Promise<AIFigure> {
    const aiFigure = await this.aiFigureRepository.findOne({ where: { id } });

    if (!aiFigure) {
      throw new NotFoundException(`AIFigure with ID ${id} not found.`);
    }

    return aiFigure;
  }

  // Update an existing AIFigure
  async updateAIFigure(
    id: string,
    input: AIFigureDtos.UpdateAIFigureDto,
  ): Promise<AIFigure> {
    // Fetch the existing AI figure
    const aiFigure = await this.getAIFigureById(id);

    // Perform the update
    try {
      Object.assign(aiFigure, input);
      return await this.aiFigureRepository.save(aiFigure);
    } catch (error) {
      throw new BadRequestException(
        `Error occurred while updating AIFigure with ID ${id}.`,
      );
    }
  }

  // Delete AIFigure by ID
  async deleteAIFigure(id: string): Promise<{ message: string }> {
    const aiFigure = await this.getAIFigureById(id); // Ensure the AI figure exists

    try {
      await this.aiFigureRepository.remove(aiFigure);
      return { message: `AIFigure with ID ${id} deleted successfully.` };
    } catch (error) {
      throw new BadRequestException(`Failed to delete AIFigure with ID ${id}.`);
    }
  }
}
