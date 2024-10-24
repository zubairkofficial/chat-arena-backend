import {
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { Message } from './entities/message.entity';
import { BaseService } from '../base/base.service';
import { MessageDto } from './dto/message.dto';
import { MessageRepository } from './message.repository';
import { handleServiceError } from '../errors/error-handling';
import { ConversationService } from '../conversation/conversation.service';

@Injectable()
export class MessageService extends BaseService {
  constructor(
    private readonly messageRepository: MessageRepository,
    dataSource: DataSource,
    private readonly entityManager: EntityManager,
    private readonly conversationService: ConversationService,
  ) {
    super(dataSource);
  }

  // Create a new message
  async createMessage(input: MessageDto.CreateMessageDto): Promise<Message> {
    const transactionScope = this.getTransactionScope();
    const message=new Message()    
    try {
      // const conversation=await this.conversationService.getConversationById(input.conversationId)
      message.content=input.content
      // message.conversation=conversation
      message.senderType=input.senderType
      message.senderId=input.senderId
      transactionScope.add(message);
      await transactionScope.commit(this.entityManager);
      return message;
    } catch (error) {
      handleServiceError(error, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to create message');
    }
  }


  async getPreviousMessages(conversationId: string, limit: number): Promise<Message[]> {
    return await this.messageRepository.find({
      where: {
        conversation: {
          id: conversationId, // Access the conversation ID through the relationship
        },
      },
      take: limit,
      order: {
        createdAt: 'DESC', // Assuming you have a timestamp for ordering
      },
    });
  }
  

  
  // Get all messages for a conversation
  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    const messages = await this.messageRepository.find({
      where: { conversation: { id: conversationId } },
      relations: ['reactions'],
    });

    if (!messages || messages.length === 0) {
      throw new NotFoundException(`No messages found for conversation ID ${conversationId}`);
    }

    return messages;
  }

  // Update a message
  async updateMessage(id: string, input: MessageDto.UpdateMessageDto): Promise<Message> {
    const transactionScope = this.getTransactionScope();
    const message = await this.messageRepository.findOneBy({ id });

    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    // Update fields
    Object.assign(message, input);

    try {
      transactionScope.update(message);
      await transactionScope.commit(this.entityManager);
      return message;
    } catch (error) {
      handleServiceError(error, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to update message');
    }
  }

  // Delete a message
  async deleteMessage(id: string): Promise<void> {
    const transactionScope = this.getTransactionScope();
    const message = await this.messageRepository.findOneBy({ id });

    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    try {
      transactionScope.delete(message);
      await transactionScope.commit(this.entityManager);
    } catch (error) {
      handleServiceError(error, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete message');
    }
  }
}
