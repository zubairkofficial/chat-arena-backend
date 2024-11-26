import { Injectable } from '@nestjs/common';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { AIFigure } from './entities/aifigure.entity';
import { CommonDTOs } from '../common/dto';
import { UserTier } from '../common/enums';

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

  public getAIFigureByIdWithRole(id: string): SelectQueryBuilder<AIFigure> {
    return this.dataSource
      .getRepository(AIFigure)
      .createQueryBuilder('aifigure')
      .leftJoinAndSelect('aifigure.arenaAIFigures', 'arenaAIFigures')
      .leftJoinAndSelect('arenaAIFigures.figureRole', 'figureRole')
      .where('aifigure.id = :id', { id });
  }

  public getAIFigureByName(name: string): SelectQueryBuilder<AIFigure> {
    return this.dataSource
      .getRepository(AIFigure)
      .createQueryBuilder('aifigure')
      .where('aifigure.name = :name', { name });
  }

  public getAllAIFigures(user: CommonDTOs.CurrentUser): SelectQueryBuilder<AIFigure> {
    const query = this.dataSource
      .getRepository(AIFigure)
      .createQueryBuilder('aifigure')
      
    if (user?.isAdmin) {
      // Admin users can access all AI figures
      return query;
    } else if (user?.tier === UserTier.PREMIUM) {
      // Premium users can access all AI figures
      return query;
    } else if (user?.tier === UserTier.FREE) {
      // Free users can only access public AI figures (if any)
      query.where('aifigure.isAiPrivate = :isAiPrivate', { isAiPrivate: false });
    }
  
    return query;
  }
  
}
