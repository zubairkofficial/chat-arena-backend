import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Import TypeOrmModule
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { Subscription } from './entities/subscription.entity'; // Import Subscription entity
import { UserModule } from '../user/user.module'; // Import UserModule for UserService
import { PackageBundle } from '../package-bundle/entities/package-bundle.entity'; // Import PackageBundle entity
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { CardRepository } from '../card/card.repository';
import { PaymentService } from '../payment/payment.service';
import { CardService } from '../card/card.service';
import { TransactionService } from '../transaction/transaction.service';
import { AIFigureRepository } from '../aifigure/aifigure.repository';
import { ArenaRepository } from '../arena/arena.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription, PackageBundle]), // Register entities with TypeORM
    UserModule, // Import UserModule for UserService
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService,ConfigService,UserService,CardRepository,PaymentService,CardService,TransactionService,AIFigureRepository,ArenaRepository],
  exports: [SubscriptionService], // Export SubscriptionService if needed elsewhere
})
export class SubscriptionModule {}
