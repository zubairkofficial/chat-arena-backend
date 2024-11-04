import { Injectable } from '@nestjs/common';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { UserAifigureMessage } from './entities/user-aifigure-message.entity';

@Injectable()
export class UserAifigureMessageRepository extends Repository<UserAifigureMessage> {
  constructor(private readonly dataSource: DataSource) {
    super(UserAifigureMessage, dataSource.createEntityManager());
  }
  

  public getUserAiFigureById(aiFigureId: string): SelectQueryBuilder<UserAifigureMessage> {
    return this.dataSource
      .getRepository(UserAifigureMessage)
      .createQueryBuilder('userAifigureMessage')
      
      .where('userAifigureMessage.aiFigure_id = :aiFigureId', { aiFigureId });
}

}
