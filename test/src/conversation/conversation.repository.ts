import { Injectable } from '@nestjs/common';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { Conversation } from './entities/conversation.entity';

@Injectable()
export class ConversationRepository extends Repository<Conversation> {
  constructor(private readonly dataSource: DataSource) {
    super(Conversation, dataSource.createEntityManager());
  }

  public getConversationById(id: string): SelectQueryBuilder<Conversation> {
    return this.dataSource
      .getRepository(Conversation)
      .createQueryBuilder('conversation')
      .where('conversation.id = :id', { id });
  }

  public getConversationByStatus(status: string): SelectQueryBuilder<Conversation> {
    return this.dataSource
      .getRepository(Conversation)
      .createQueryBuilder('conversation')
      .where('conversation.status = :status', { status });
  }

  public getAllConversations(): SelectQueryBuilder<Conversation> {
    return this.dataSource
      .getRepository(Conversation)
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.arena', 'arena')
      .leftJoinAndSelect('conversation.messages', 'messages');
  }

  public getConversationByTopic(topic: string): SelectQueryBuilder<Conversation> {
    return this.dataSource
      .getRepository(Conversation)
      .createQueryBuilder('conversation')
      .where('conversation.topic = :topic', { topic });
  }
}
