import { Module } from '@nestjs/common';
import { AIFigureController } from './aifigure.controller';
import { AIFigureService } from './aifigure.service';
import { AIFigureRepository } from './aifigure.repository';

@Module({
  controllers: [AIFigureController],
  providers: [AIFigureService, AIFigureRepository],
})
export class AifigureModule {}
