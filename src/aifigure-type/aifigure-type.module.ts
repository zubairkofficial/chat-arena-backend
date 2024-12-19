import { Module } from '@nestjs/common';
import { AifigureTypeService } from './aifigure-type.service';
import { AifigureTypeController } from './aifigure-type.controller';
import { AifigureTypeRepository } from './aiFigureTypeRepository';

@Module({
  controllers: [AifigureTypeController],
  providers: [AifigureTypeService,AifigureTypeRepository],
})
export class AifigureTypeModule {}
