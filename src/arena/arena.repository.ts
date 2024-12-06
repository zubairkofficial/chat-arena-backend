import { Injectable } from '@nestjs/common';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { Arena } from './entities/arena.entity';
import { CommonDTOs } from '../common/dto';
import { UserTier } from '../common/enums';

@Injectable()
export class ArenaRepository extends Repository<Arena> {
  constructor(private readonly dataSource: DataSource) {
    super(Arena, dataSource.createEntityManager());
  }

  public getArenaByName(name: string): SelectQueryBuilder<Arena> {
    return this.dataSource
      .getRepository(Arena)
      .createQueryBuilder('arena')
      .where('arena.name = :name', { name });
  }

  public getArenaById(id: string): SelectQueryBuilder<Arena> {
    return this.dataSource
      .getRepository(Arena)
      .createQueryBuilder('arena')
      .where('arena.id = :id', { id });
  }

  public getArenaByStatus(status: string): SelectQueryBuilder<Arena> {
    return this.dataSource
      .getRepository(Arena)
      .createQueryBuilder('arena')
      .where('arena.status = :status', { status });
  }

  public getAllArenas(user: CommonDTOs.CurrentUser): SelectQueryBuilder<Arena> {
    const query = this.dataSource
      .getRepository(Arena)
      .createQueryBuilder('arena')
      .leftJoinAndSelect('arena.arenaType', 'arenaType')
      .leftJoinAndSelect('arena.arenaAIFigures', 'arenaAIFigures')
      .leftJoinAndSelect('arenaAIFigures.aiFigure', 'aiFigure')
      .addSelect('aiFigure.name')
      .leftJoinAndSelect('arena.userArenas', 'userArenas')
      .leftJoinAndSelect('arena.conversations', 'conversations');
  
    if (user?.isAdmin) {
      // Admin users can access all arenas
      return query;
    } else if (user?.tier === UserTier.PREMIUM) {
      // Premium users can access all arenas
      return query;
    } else if (user?.tier ===UserTier.FREE) {
      // Free users can only access public arenas (isPrivate: false)
      query.where('arena.isPrivate = :isPrivate', { isPrivate: false });
    }
  
    return query;
  }
  

  public getUserArenaList(arenaId: string): SelectQueryBuilder<Arena> {
    return this.dataSource
      .getRepository(Arena)
      .createQueryBuilder('arena')
      .leftJoinAndSelect('arena.arenaType', 'arenaType')
      .leftJoinAndSelect('arena.arenaAIFigures', 'arenaAIFigures')
      .leftJoinAndSelect('arenaAIFigures.aiFigure', 'aiFigure')
      .leftJoinAndSelect('arena.userArenas', 'userArenas')
      .leftJoinAndSelect('userArenas.user', 'user')  // Join the User entity from userArenas
      .leftJoinAndSelect('arena.conversations', 'conversations')
      .where('arena.id = :arenaId', { arenaId });
}


public getArenaByIdAndJoin(arenaId: string): SelectQueryBuilder<Arena> {
  return this.dataSource
    .getRepository(Arena)
    .createQueryBuilder('arena')
    .leftJoinAndSelect('arena.userArenas', 'userArena') // Correct relation name
    .leftJoinAndSelect('userArena.user', 'user') // Join and select the User entity
    .where('arena.id = :arenaId', { arenaId }) // Filter on arena.id
}

public getArenaWithAIFigure(arenaId: string): SelectQueryBuilder<Arena> {
  return this.dataSource
    .getRepository(Arena)
    .createQueryBuilder('arena')
    .leftJoinAndSelect('arena.arenaAIFigures', 'arenaAIFigures') // Correct relation name
    .leftJoinAndSelect('arenaAIFigures.aiFigure', 'aiFigure') // Join and select the User entity
    .leftJoinAndSelect('arenaAIFigures.figureRole', 'figureRole') // Join and select the User entity
    .where('arena.id = :arenaId', { arenaId }) // Filter on arena.id
}


}
