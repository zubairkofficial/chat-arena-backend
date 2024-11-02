import { Module } from '@nestjs/common';
import { UserAifigureMessageService } from './user-aifigure-message.service';
import { UserAifigureMessageController } from './user-aifigure-message.controller';
import { UserService } from '../user/user.service';
import { UserRepository } from '../user/user.repository';
import { ConfigService } from '@nestjs/config';
import { UserAifigureMessageRepository } from './user-aifigure-message.repository';

@Module({
  controllers: [UserAifigureMessageController],
  providers: [UserAifigureMessageService,UserService,UserRepository,ConfigService,UserAifigureMessageRepository],
})
export class UserAifigureMessageModule {}
