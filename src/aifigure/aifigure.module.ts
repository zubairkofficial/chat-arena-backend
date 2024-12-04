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
import { ArenaAiFigureRepository } from '../arena-ai-figure/arena-ai-figure.repository';
import { LlmModelService } from '../llm-model/llm-model.service';
import { ArenaRepository } from '../arena/arena.repository';

@Module({
  controllers: [AIFigureController],
  providers: [LangChainService,AIFigureService, AIFigureRepository,ConfigService,UserAifigureMessageService,UserService,UserRepository,UserAifigureMessageRepository,ArenaAiFigureRepository,LlmModelService,ArenaRepository],
})
export class AifigureModule {}
