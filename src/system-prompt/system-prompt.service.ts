import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SystemPrompt } from './entities/system-prompt.entity';
import { BaseService } from '../base/base.service';
import { DataSource, EntityManager } from 'typeorm';
import { AllExceptionsFilter } from '../errors/http-exception.filter'; // Adjust the import as necessary
import { SystemPromptRepository } from './system-prompt.repository';
import { SystemPromptDto } from './dto/system-prompt.dto';

@Injectable()
export class SystemPromptService extends BaseService {
  constructor(
    private readonly systemPromptRepository: SystemPromptRepository,
    dataSource: DataSource,
    private readonly entityManager: EntityManager,
  ) {
    super(dataSource);
  }

  // Create a new SystemPrompt
  async createSystemPrompt(
    input: SystemPromptDto.CreateSystemPromptDto,
  ): Promise<SystemPrompt> {
    const transactionScope = this.getTransactionScope();
    const systemPrompt = new SystemPrompt();

    systemPrompt.description = input.description;
    systemPrompt.prompt = input.prompt;

    try {
      transactionScope.add(systemPrompt);
      await transactionScope.commit(this.entityManager); // Use entityManager for transaction
      return systemPrompt;
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  // Create multiple SystemPrompts
  async createManySystemPrompts(
    createSystemPromptDtos: SystemPromptDto.CreateSystemPromptDto[],
  ): Promise<SystemPrompt[]> {
    const transactionScope = this.getTransactionScope();

    const systemPrompts = await Promise.all(
      createSystemPromptDtos.map((dto) => {
        const systemPrompt = new SystemPrompt();
        systemPrompt.description = dto.description;
        systemPrompt.prompt = dto.prompt;

        transactionScope.add(systemPrompt); // Add each systemPrompt to the transaction
        return systemPrompt;
      }),
    );

    try {
      await transactionScope.commit(this.entityManager); // Commit all at once
      return systemPrompts;
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  // Get all SystemPrompts
  async getAllSystemPrompts(): Promise<SystemPrompt[]> {
    try {
      return await this.systemPromptRepository.find();
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  // Get a specific SystemPrompt by ID
  async getSystemPromptById(id: string): Promise<SystemPrompt> {
    try {
      
      const systemPrompt = await this.systemPromptRepository.findOne({
        where: { id },  // Use 'where' to specify the condition
      });
      if (!systemPrompt) {
        throw new NotFoundException(`SystemPrompt with ID ${id} not found.`);
      }
      return systemPrompt;
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  // Update an existing SystemPrompt
  async updateSystemPrompt(
    id: string,
    updateSystemPromptDto: SystemPromptDto.UpdateSystemPromptDto,
  ): Promise<SystemPrompt> {
    const transactionScope = this.getTransactionScope();
    const systemPrompt = await this.getSystemPromptById(id); // Ensure the system prompt exists

    // Update fields
    systemPrompt.description =
      updateSystemPromptDto.description || systemPrompt.description;
    systemPrompt.prompt = updateSystemPromptDto.prompt || systemPrompt.prompt;

    try {
      transactionScope.update(systemPrompt); // Use update method in the transaction scope
      await transactionScope.commit(this.entityManager); // Commit changes
      return systemPrompt;
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  // Delete a SystemPrompt
  async deleteSystemPrompt(id: string): Promise<void> {
    const transactionScope = this.getTransactionScope();
    const systemPrompt = await this.getSystemPromptById(id); // Ensure the system prompt exists

    try {
      transactionScope.delete(systemPrompt); // Use delete method in the transaction scope
      await transactionScope.commit(this.entityManager); // Commit deletion
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }
}
