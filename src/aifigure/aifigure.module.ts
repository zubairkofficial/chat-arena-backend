import { Module } from '@nestjs/common';
import { AIFigureController } from './aifigure.controller';
import { AIFigureService } from './aifigure.service';
import { AIFigureRepository } from './aifigure.repository';
import { ConfigService } from '@nestjs/config';
import { LangChainService } from '../langchain/langchain.service';

@Module({
  controllers: [AIFigureController],
  providers: [LangChainService,AIFigureService, AIFigureRepository,ConfigService],
})
export class AifigureModule {}
