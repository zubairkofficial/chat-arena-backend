import { Injectable } from '@nestjs/common';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { AIFigure } from './entities/aifigure.entity';

@Injectable()
export class AIFigureRepository extends Repository<AIFigure> {
  constructor(private readonly dataSource: DataSource) {
    super(AIFigure, dataSource.createEntityManager());
  }

  public getAIFigureById(id: string): SelectQueryBuilder<AIFigure> {
    return this.dataSource
      .getRepository(AIFigure)
      .createQueryBuilder('aifigure')
      .where('aifigure.id = :id', { id });
  }

  public getAIFigureByName(name: string): SelectQueryBuilder<AIFigure> {
    return this.dataSource
      .getRepository(AIFigure)
      .createQueryBuilder('aifigure')
      .where('aifigure.name = :name', { name });
  }

  public getAllAIFigures(): SelectQueryBuilder<AIFigure> {
    return this.dataSource
      .getRepository(AIFigure)
      .createQueryBuilder('aifigure')
      .leftJoinAndSelect('aifigure.arenas', 'arenas');
  }
}
