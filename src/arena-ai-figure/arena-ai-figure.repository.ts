import {
    Injectable,
  } from '@nestjs/common';
  import { DataSource, Repository } from 'typeorm';
import { ArenaAIFigure } from './entities/arena-ai-figure.entity';
  
  @Injectable()
  export class ArenaAiFigureRepository extends Repository<ArenaAIFigure> {
    constructor(private readonly dataSource: DataSource) {
      super(ArenaAIFigure, dataSource.createEntityManager());
    }
  
   
  }
  