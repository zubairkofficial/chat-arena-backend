import { Injectable } from '@nestjs/common';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { User } from './entities/user.entity';
import { AIFigureStatus, ArenaRequestStatus } from '../common/enums';

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

  public activeUsers(): SelectQueryBuilder<User> {
    return this.dataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .where('user.isActive = :isActive', { isActive: true })
      .andWhere('user.isAdmin = :isAdmin', { isAdmin: false });
  }
  
 

  public getUserByIdWithJoins(id: string): SelectQueryBuilder<User> {
    try {
      // Query to get user with arena count and AI figure count
      const query = this.dataSource
        .getRepository(User)
        .createQueryBuilder('user')
        .leftJoin('user.userArenas', 'userArena')  // Join UserArena to get the arenas the user is part of
        .leftJoin('user.userAifigureMessage', 'userAifigureMessage')  // Join UserAifigureMessage to get AI figures
        .addSelect('COUNT(userArena.id)', 'arenasCount')  // Count the arenas the user is part of
        .addSelect('COUNT(userAifigureMessage.aiFigure_id)', 'totalAiFiguresCount')  // Count total AI figures (aiFigure_id) associated with the user
 
        // .addSelect('COUNT(DISTINCT userAifigureMessage.arena_id)', 'distinctArenaFiguresCount')  // Count distinct arenaId for AI figures
        .addSelect('COUNT(DISTINCT userAifigureMessage.aiFigure_id)', 'distinctAiFiguresCount')  // Count distinct aiFigure_id for AI figures associated with the user
 
        .where('user.id = :id', { id })
        .groupBy('user.id');  // Group by user id to get a single result per user

      // Execute the query and return the result
      return  query
    } catch (error) {
      // Handle any errors by throwing a custom exception or logging
      throw new Error('Error fetching user with arena and AI figure counts');
    }
  }
  
  
  public  getUsersWithPendingStatus(): SelectQueryBuilder<User> {
    return this.dataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .where('user.createArenaRequestStatus = :status', { status: ArenaRequestStatus.PENDING })
   }
   
  public  getUsersWithAiFigurePendingStatus(): SelectQueryBuilder<User> {
    return this.dataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .where('user.aiFigureRequestStatus = :status', { status: AIFigureStatus.PENDING })
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
