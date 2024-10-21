import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TransactionScope } from './transactionScope';

export abstract class BaseService {
  constructor(private readonly dataSource: DataSource) {}

  protected getTransactionScope(): TransactionScope {
    return new TransactionScope(this.dataSource); // Pass the dataSource
  }
}
