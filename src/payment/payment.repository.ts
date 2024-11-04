import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Payment } from './payment.entity';

@Injectable()
export class PaymentRepository extends Repository<Payment> {
  constructor(private readonly dataSource: DataSource) {
    super(Payment, dataSource.createEntityManager());
  }
}
