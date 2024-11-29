import { Injectable, NotFoundException, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { LlmModel } from './entities/llm-model.entity'; // Assuming you have an entity for LLM model
import { LlmModelDtos } from './dto/llm-model.dto';
import { BaseService } from '../base/base.service';
import { EntityManager, DataSource } from 'typeorm';
import { CommonDTOs } from '../common/dto';
import { UserService } from '../user/user.service';
import { handleServiceError } from '../errors/error-handling'; // Import error handling function
import { InValidCredentials } from '../errors/exceptions';
import { ModelType } from '../common/enums';

@Injectable()
export class LlmModelService extends BaseService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly userService: UserService,
    dataSource: DataSource,
  ) {
    super(dataSource);
  }

  // Create a new LLM model
  async createLLMModel(
    input: LlmModelDtos.CreateLlmModelDto,
    currentUser: CommonDTOs.CurrentUser
  ): Promise<LlmModel> {
    const transactionScope = this.getTransactionScope(); // Start a transaction

    try {
      const user = await this.userService.getUserById(currentUser.id);
      if (!user) throw new InValidCredentials('Invalid user specified');

      const newModel = new LlmModel();
      newModel.name = input.name;
      newModel.apiKey = input.apiKey;
      newModel.modelType = input.modelType;
      newModel.user = user;

      // Add the new model to the transaction
      transactionScope.add(newModel);
      
      // Commit the transaction and persist the model in the database
      await transactionScope.commit(this.entityManager);
      return newModel;
    } catch (error) {
      handleServiceError(error.errorLogService, HttpStatus.BAD_REQUEST, 'Failed to create LLM model');
    }
  }

  // Get all LLM models
  async findAll(): Promise<LlmModel[]> {
    try {
      return await this.entityManager.getRepository(LlmModel).find(); // Fetch all models from DB
    } catch (error) {
      handleServiceError(error.errorLogService, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve LLM models');
    }
  }

  // Get a specific LLM model by ID
  async findOne(id: string): Promise<LlmModel> {
    try {
      // Ensure you're passing only the UUID (id), not the full object
      if (!id || typeof id !== 'string') {
        throw new BadRequestException('Invalid UUID format');
      }
  
      const model = await this.entityManager.getRepository(LlmModel).findOne({
        where: { id },
      });
  
      if (!model) {
        throw new NotFoundException(`LLM model with id ${id} not found`);
      }
      return model;
    } catch (error) {
      handleServiceError(error.errorLogService, HttpStatus.NOT_FOUND, `LLM model with id ${id} not found`);
    }
  }
  
  async getLlmModelByName(): Promise<LlmModel> {
    try {
      const model = await this.entityManager.getRepository(LlmModel).findOne({
        where: { modelType:ModelType.GPT_4o_Mini },
      });

      if (!model) {
        throw new NotFoundException(`LLM model with modelType ${ModelType.GPT_4o_Mini} not found`);
      }
      return model;
    } catch (error) {
      handleServiceError(error.errorLogService, HttpStatus.NOT_FOUND, `LLM model with modelType ${ModelType.GPT_4o_Mini} not found`);
    }
  }

  // Update an existing LLM model by ID
  async update(
    id: string,
    updateLlmModelDto: LlmModelDtos.UpdateLlmModelDto,
  ): Promise<LlmModel> {
    try {
      const model = await this.findOne(id); // Find the model to update

      // Update properties if they exist in the update DTO
      model.name = updateLlmModelDto.name ?? model.name;
      model.apiKey = updateLlmModelDto.apiKey ?? model.apiKey;
      model.modelType = updateLlmModelDto.modelType ?? model.modelType;

      // Save the updated model back to the database
      await this.entityManager.getRepository(LlmModel).save(model);

      return model;
    } catch (error) {
      handleServiceError(error.errorLogService, HttpStatus.BAD_REQUEST, 'Failed to update LLM model');
    }
  }

  // Remove an LLM model by ID
  async remove(id: string): Promise<string> {
    try {
      const model = await this.findOne(id); // Find the model to delete

      // Remove the model from the database
      await this.entityManager.getRepository(LlmModel).remove(model);

      return `LLM model with id ${id} has been removed`;
    } catch (error) {
      handleServiceError(error.errorLogService, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to remove LLM model');
    }
  }
}
