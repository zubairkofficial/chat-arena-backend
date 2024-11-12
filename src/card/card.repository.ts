import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Card } from './entities/card.entity';

@Injectable()
export class CardRepository extends Repository<Card> {
  constructor(private readonly dataSource: DataSource) {
    super(Card, dataSource.createEntityManager());
  }

}
