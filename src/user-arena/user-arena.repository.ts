import { Injectable } from '@nestjs/common';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { UserArena } from './entities/user-arena.entity';

@Injectable()
export class UserArenaRepository extends Repository<UserArena> {
  constructor(private readonly dataSource: DataSource) {
    super(UserArena, dataSource.createEntityManager());
  }


 
}
