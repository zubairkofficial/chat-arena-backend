import { Module } from '@nestjs/common';
import { AIFigureController } from './aifigure.controller';
import { AIFigureService } from './aifigure.service';
import { AIFigureRepository } from './aifigure.repository';
import { ConfigService } from '@nestjs/config';
import { LangChainService } from '../langchain/langchain.service';
import { UserAifigureMessageService } from '../user-aifigure-message/user-aifigure-message.service';
import { UserService } from '../user/user.service';
import { UserRepository } from '../user/user.repository';
import { UserAifigureMessageRepository } from '../user-aifigure-message/user-aifigure-message.repository';

@Module({
  controllers: [AIFigureController],
  providers: [LangChainService,AIFigureService, AIFigureRepository,ConfigService,UserAifigureMessageService,UserService,UserRepository,UserAifigureMessageRepository],
})
export class AifigureModule {}
