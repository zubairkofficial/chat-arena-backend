import { Module } from '@nestjs/common';
import { AIFigureController } from './aifigure.controller';
import { AIFigureService } from './aifigure.service';
import { AIFigureRepository } from './aifigure.repository';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [AIFigureController],
  providers: [AIFigureService, AIFigureRepository,ConfigService],
})
export class AifigureModule {}
