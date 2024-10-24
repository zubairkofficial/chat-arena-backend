import { Injectable } from '@nestjs/common';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { UserArena } from './entities/user-arena.entity';

@Injectable()
export class UserArenaRepository extends Repository<UserArena> {
  constructor(private readonly dataSource: DataSource) {
    super(UserArena, dataSource.createEntityManager());
  }


 public getUserAndArena(arenaId: string,userId:string): SelectQueryBuilder<UserArena> {
    return this.dataSource
      .getRepository(UserArena)
      .createQueryBuilder('userArena')
      .where('userArena.arenaId = :arenaId', { arenaId })
      .andWhere('userArena.userId = :userId', { userId });
  }
 
}
