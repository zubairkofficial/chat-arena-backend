import { Module } from '@nestjs/common';
import { LlmModelService } from './llm-model.service';
import { LlmModelController } from './llm-model.controller';
import { UserService } from '../user/user.service';
import { UserRepository } from '../user/user.repository';
import { ConfigService } from '@nestjs/config';
import { LlmModelRepository } from './llm-model.repository';
import { AIFigureRepository } from '../aifigure/aifigure.repository';
import { ArenaRepository } from '../arena/arena.repository';

@Module({
  controllers: [LlmModelController],
  providers: [LlmModelService,UserService,UserRepository,ConfigService,LlmModelRepository,AIFigureRepository,ArenaRepository],
})
export class LlmModelModule {}
