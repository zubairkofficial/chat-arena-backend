import { UserAifigureMessageService } from './../user-aifigure-message/user-aifigure-message.service';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { AIFigureRepository } from './aifigure.repository';
import { AIFigureDtos } from './dto/aifigure.dto';
import { AIFigure } from './entities/aifigure.entity';
import { BaseService } from '../base/base.service';
import { DataSource, EntityManager } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { LangChainService } from '../langchain/langchain.service';
import { AllExceptionsFilter } from '../errors/http-exception.filter'; // Adjust the import as necessary
import { CommonDTOs } from '../common/dto';
import { BASE_URL } from '../common/constants';
import { UserAifigureMessage } from '../user-aifigure-message/entities/user-aifigure-message.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class AIFigureService extends BaseService {
  constructor(
    private readonly aiFigureRepository: AIFigureRepository,
    private readonly configService: ConfigService,
    private readonly langchainService: LangChainService,
    private readonly userService: UserService,
    private readonly entityManager: EntityManager,
    private readonly userAifigureMessageService: UserAifigureMessageService,
    dataSource: DataSource,
  ) {
    super(dataSource);
  }

  // Create a new AIFigure
  async createAIFigure(file, input: AIFigureDtos.CreateAIFigureDto): Promise<AIFigure> {
    if (file) {
      const baseUrl = this.configService.get('BACK_END_BASE_URL') || BASE_URL;
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
const user=await this.userService.getUserById(currentUser.id)
    const userAiFigureContext=await this.userAifigureMessageService.getPreviousMessage(figureId,process.env.NUMBER_OF_Previous_Messages ? +process.env.NUMBER_OF_Previous_Messages: 10)
    const context = userAiFigureContext.map((message) => ({
  
  sendMessage: message.sendMessage,
  receiveMessage: message.receiveMessage,
}));
    try {
      
    const langChainMessage= await this.langchainService.aiFigureMessage(aiFigure, message,context);
    user.availableCoins=Number(user.availableCoins)-Number(process.env.DEDUCTION_COINS)
    await this.userService.updateUserSubtractCoins( user.availableCoins,user,)
    await this.userAifigureMessageService.createUserAiFigure(aiFigure,message,langChainMessage,currentUser)
   return langChainMessage
   

  
  } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  async getAiFigureMessage(figureId: string,currentUser: CommonDTOs.CurrentUser): Promise<UserAifigureMessage[]> {
    const aiFigure = await this.getAIFigureById(figureId);
    if (!aiFigure) throw new NotFoundException('Invalid AI figure specified.');
const userAiFigureContext=await this.userAifigureMessageService.getPreviousMessageUserById(figureId,currentUser.id)

    try {
      
    return userAiFigureContext
   

  
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
      const aiFigure = await this.aiFigureRepository.getAIFigureByIdWithRole(id).getOne();
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
    if (!aiFigure) throw new NotFoundException('Invalid AI figure specified.');


    try {
      Object.assign(aiFigure, input);
      return await this.aiFigureRepository.save(aiFigure);
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  // Delete AIFigure by ID
  async deleteAIFigure(aiFigureId: string): Promise<{ message: string }> {
       try {
        const transactionScop=this.getTransactionScope()
        const aiFigure = await this.getAIFigureById(aiFigureId); // Ensure the AI figure exists
        if (!aiFigure) throw new NotFoundException('Invalid AI figure specified.');
       const userAiFigureMessage=await this.userAifigureMessageService.deleteUserAiFigure(aiFigureId)    
      transactionScop.deleteCollection(userAiFigureMessage)
      transactionScop.delete(aiFigure)
      await transactionScop.commit(this.entityManager)
      return { message: `AIFigure with ID deleted successfully.` };
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }
}
