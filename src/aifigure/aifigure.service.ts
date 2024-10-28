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
import { ConfigService } from '@nestjs/config';
import { LangChainService } from '../langchain/langchain.service';
import { AllExceptionsFilter } from '../errors/http-exception.filter'; // Adjust the import as necessary
import { CommonDTOs } from '../common/dto';

@Injectable()
export class AIFigureService extends BaseService {
  constructor(
    private readonly aiFigureRepository: AIFigureRepository,
    private readonly configService: ConfigService,
    private readonly langchainService: LangChainService,
    dataSource: DataSource,
  ) {
    super(dataSource);
  }

  // Create a new AIFigure
  async createAIFigure(file: Express.Multer.File, input: AIFigureDtos.CreateAIFigureDto): Promise<AIFigure> {
    if (file) {
      const baseUrl = this.configService.get('BACK_END_BASE_URL') || 'http://localhost:8080';
      input.image = `${baseUrl}/uploads/${file.filename}`; // Set complete URL path
    }
    if (!input.name) {
      throw new BadRequestException('Name is required field.');
    }

    try {
      const newAIFigure = await this.aiFigureRepository.save(input);
      return newAIFigure;
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  async aiFigureMessage(figureId: string, message: string,currentUser: CommonDTOs.CurrentUser): Promise<string> {
    const aiFigure = await this.getAIFigureById(figureId);
    if (!aiFigure) throw new NotFoundException('Invalid AI figure specified.');

    try {
      // const userAiFigure=this.
    return await this.langchainService.aiFigureMessage(aiFigure.type, aiFigure.prompt, message);

    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  // Get all AIFigures
  async getAllAIFigures(): Promise<AIFigure[]> {
    try {
      return await this.aiFigureRepository.find();
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  // Get AIFigure by ID
  async getAIFigureById(id: string): Promise<AIFigure> {
    try {
      const aiFigure = await this.aiFigureRepository.findOne({ where: { id } });
      if (!aiFigure) {
        throw new NotFoundException(`AIFigure with ID ${id} not found.`);
      }
      return aiFigure;
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  // Update an existing AIFigure
  async updateAIFigure(
    id: string,
    input: AIFigureDtos.UpdateAIFigureDto,
  ): Promise<AIFigure> {
    const aiFigure = await this.getAIFigureById(id);

    try {
      Object.assign(aiFigure, input);
      return await this.aiFigureRepository.save(aiFigure);
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  // Delete AIFigure by ID
  async deleteAIFigure(id: string): Promise<{ message: string }> {
    const aiFigure = await this.getAIFigureById(id); // Ensure the AI figure exists

    try {
      await this.aiFigureRepository.remove(aiFigure);
      return { message: `AIFigure with ID ${id} deleted successfully.` };
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }
}
