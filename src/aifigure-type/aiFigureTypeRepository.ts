import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AifigureType } from './entities/aifigure-type.entity';

@Injectable()
export class AifigureTypeRepository extends Repository<AifigureType> {
  constructor(private readonly dataSource: DataSource) {
    super(AifigureType, dataSource.createEntityManager());
  }
}
