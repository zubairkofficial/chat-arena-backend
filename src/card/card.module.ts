import { Module } from '@nestjs/common';
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { UserRepository } from '../user/user.repository';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { PaymentService } from '../payment/payment.service';
import { TransactionService } from '../transaction/transaction.service';
import { CardRepository } from './card.repository';
import { AIFigureRepository } from '../aifigure/aifigure.repository';

@Module({
  controllers: [CardController],
  providers: [CardService,UserRepository,UserService,ConfigService,PaymentService,TransactionService,CardRepository,AIFigureRepository],
})
export class CardModule {}
