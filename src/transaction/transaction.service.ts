import { Injectable } from '@nestjs/common';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { CardDtos } from '../payment/dto/payment.dto';
import { TransactionScope } from '../base/transactionScope';
import { Transaction } from './entities/transaction.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class TransactionService {
  createTransaction(user: User, input: CardDtos.ExisitngCardInputDto,ts: TransactionScope) {
   
    const transaction=new Transaction()
    transaction.coins=input.coins
    transaction.price=input.price
    transaction.user=user
    return transaction

  }

  findAll() {
    return `This action returns all transaction`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
