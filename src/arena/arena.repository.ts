import { Injectable } from '@nestjs/common';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { Arena } from './entities/arena.entity';

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

  public getAllArenas(): SelectQueryBuilder<Arena> {
    return this.dataSource
      .getRepository(Arena)
      .createQueryBuilder('arena')
      .leftJoinAndSelect('arena.arenaType', 'arenaType')
      .leftJoinAndSelect('arena.arenaAIFigures', 'arenaAIFigures')
      .leftJoinAndSelect('arenaAIFigures.aiFigure', 'aiFigure')
      .leftJoinAndSelect('arena.userArenas', 'userArenas')
      .leftJoinAndSelect('arena.conversations', 'conversations');
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


}
