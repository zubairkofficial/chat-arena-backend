import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Conversation } from './entities/conversation.entity';
import {  DataSource, EntityManager } from 'typeorm';
import { ConversationDto } from './dto/conversation.dto';
import { BaseService } from '../base/base.service';
import { ArenaService } from '../arena/arena.service';
import { ConversationRepository } from './conversation.repository';

@Injectable()
export class ConversationService extends BaseService {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly arenaService: ArenaService,
    dataSource: DataSource,
    private readonly entityManager: EntityManager,

  ) {
    super(dataSource);
  }

  // Utility function to handle service errors
  private handleServiceError(error: any, defaultMessage: string): void {
    if (error instanceof BadRequestException || error instanceof NotFoundException) {
      throw error; // Rethrow known exceptions
    } else {
      throw new InternalServerErrorException(defaultMessage);
    }
  }

  // Create a new conversation
  async createConversation(
    input: ConversationDto.CreateConversationDto,
  ): Promise<Conversation> {
    const transactionScope = this.getTransactionScope();
    const conversation=new Conversation()

    let arena
if(input.arenaId){
  arena=await this.arenaService.getArenaById(input.arenaId)
}

conversation.topic=input.topic
conversation.arena=arena
    try {
      transactionScope.add(conversation);
      await transactionScope.commit(this.entityManager);
      return conversation;
    } catch (error) {
      this.handleServiceError(error.errorLogService, 'Failed to create conversation');
    }
  }

  // Create multiple conversations
  async createManyConversations(
    createConversationDtos: ConversationDto.CreateConversationDto[],
  ): Promise<Conversation[]> {
    const transactionScope = this.getTransactionScope();

    const conversations = await Promise.all(
      createConversationDtos.map((dto) => {
        const conversation = this.conversationRepository.create(dto);
        transactionScope.add(conversation);
        return conversation;
      }),
    );

    try {
      await transactionScope.commit(this.entityManager);
      return conversations;
    } catch (error) {
      this.handleServiceError(error.errorLogService, 'Failed to create multiple conversations');
    }
  }

  // Get all conversations
  async getAllConversations(): Promise<Conversation[]> {
    try {
      return await this.conversationRepository.find({
        relations: ['arena', 'messages'],
      });
    } catch (error) {
      this.handleServiceError(error.errorLogService, 'Failed to retrieve conversations');
    }
  }

  // Get a specific conversation by ID
// Get a specific conversation by ID
async getConversationById(id: string): Promise<Conversation> {
  try {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      // relations: ['arena', 'messages'],
    });
    
    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found.`);
    }
    
    return conversation;
  } catch (error) {
    this.handleServiceError(error.errorLogService, `Failed to find conversation with ID ${id}`);
  }
}


  // Update an existing conversation
  async updateConversation(
    id: string,
    updateConversationDto: ConversationDto.UpdateConversationDto,
  ): Promise<Conversation> {
    const transactionScope = this.getTransactionScope();
    const conversation = await this.getConversationById(id); // Ensure the conversation exists

    // Update fields
    conversation.topic = updateConversationDto.topic || conversation.topic;

    try {
      transactionScope.update(conversation);
      await transactionScope.commit(this.entityManager);
      return conversation;
    } catch (error) {
      this.handleServiceError(error.errorLogService, 'Failed to update conversation');
    }
  }

  // Delete a conversation
  async deleteConversation(id: string): Promise<void> {
    const transactionScope = this.getTransactionScope();
    const conversation = await this.getConversationById(id); // Ensure the conversation exists

    try {
      transactionScope.delete(conversation);
      await transactionScope.commit(this.entityManager);
    } catch (error) {
      this.handleServiceError(error.errorLogService, 'Failed to delete conversation');
    }
  }
}
