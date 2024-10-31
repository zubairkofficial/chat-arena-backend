import { Module } from '@nestjs/common';
import { UserAifigureMessageService } from './user-aifigure-message.service';
import { UserAifigureMessageController } from './user-aifigure-message.controller';

@Module({
  controllers: [UserAifigureMessageController],
  providers: [UserAifigureMessageService],
})
export class UserAifigureMessageModule {}
