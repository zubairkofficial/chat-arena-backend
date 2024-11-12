import { Injectable } from '@nestjs/common';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private readonly dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  public getUserByEmail(email: string): SelectQueryBuilder<User> {
    return this.dataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .where('user.email = :email', { email });
  }
  public getUserName(username: string): SelectQueryBuilder<User> {
    return this.dataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .where('user.username = :username', { username });
  }
  public getUserById(id: string): SelectQueryBuilder<User> {
    return this.dataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .where('user.id = :id', { id });
  }

  public getUserByPhoneNumber(phoneNumber: string): SelectQueryBuilder<User> {
    return this.dataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .where('user.phoneNumber = :phoneNumber', { phoneNumber });
  }
  public getUserByUsername(username: string): SelectQueryBuilder<User> {
    return this.dataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .where('user.username = :username', { username });
  }
  public getAllUser(): SelectQueryBuilder<User> {
    return this.dataSource.getRepository(User).createQueryBuilder('user');
  }
  
  public getHistoryByUserId(userId: string): SelectQueryBuilder<User> {
    return this.dataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userAifigureMessage', 'userAifigureMessage')
      .withDeleted()
      .leftJoinAndSelect('userAifigureMessage.aiFigure', 'aiFigure')
      .withDeleted()
      .where('user.id = :userId', { userId });
}

public getFigureByUserId(userId: string): SelectQueryBuilder<User> {
  return this.dataSource
    .getRepository(User)
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.userAifigureMessage', 'userAifigureMessage')
    .withDeleted() // Include soft-deleted records for userAifigureMessage
    .leftJoinAndSelect('userAifigureMessage.aiFigure', 'aiFigure')
    .withDeleted() // Include soft-deleted records for aiFigure
    .select(['user.id', 'userAifigureMessage.id', 'aiFigure.name']) // Ensure that the aiFigure.name is explicitly included
    .where('user.id = :userId', { userId })
    .distinct(true);
}
public userTransaction(): SelectQueryBuilder<User> {
  return this.dataSource
    .getRepository(User)
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.transactions', 'transactions')
    
}

 
}
