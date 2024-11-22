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
import { ArenaService } from '../arena/arena.service';

@Injectable()
export class MessageService extends BaseService {
  constructor(
    private readonly messageRepository: MessageRepository,
    dataSource: DataSource,
    private readonly entityManager: EntityManager,
    private readonly arenaService: ArenaService,
  ) {
    super(dataSource);
  }

  // Create a new message
  async createMessage(input: MessageDto.CreateMessageDto): Promise<Message> {
    const transactionScope = this.getTransactionScope();
    const message = new Message();    

    try {
      const arena = await this.arenaService.getArenaById(input.arenaId);
      if(!arena)throw new NotFoundException("Invalid arena specified")
      message.content = input.content;
      message.senderType = input.senderType;
      message.senderId = input.senderId;
      message.arenas = arena;

      transactionScope.add(message);
      await transactionScope.commit(this.entityManager);
      return message;
    } catch (error) {
      throw handleServiceError(error.errorLogService, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to create message');
    }
  }

  // Get previous messages for an arena
  async getPreviousMessages(arenaId: string, limit: number): Promise<Message[]> {
    return await this.messageRepository.find({
      where: {
        arenas: {
          id: arenaId,
        },
      },
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // Get all messages for a conversation
  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    const messages = await this.messageRepository.find({
      where: { arenas: { id: conversationId } },
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
      throw handleServiceError(error.errorLogService, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to update message');
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
      throw handleServiceError(error.errorLogService, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete message');
    }
  }
}
