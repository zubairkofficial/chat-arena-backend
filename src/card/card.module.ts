import { Module } from '@nestjs/common';
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { UserRepository } from '../user/user.repository';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [CardController],
  providers: [CardService,UserRepository,UserService,ConfigService],
})
export class CardModule {}
