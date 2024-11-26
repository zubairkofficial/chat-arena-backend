import { Module } from '@nestjs/common';
import { LlmModelService } from './llm-model.service';
import { LlmModelController } from './llm-model.controller';
import { UserService } from '../user/user.service';
import { UserRepository } from '../user/user.repository';
import { ConfigService } from '@nestjs/config';
import { LlmModelRepository } from './llm-model.repository';

@Module({
  controllers: [LlmModelController],
  providers: [LlmModelService,UserService,UserRepository,ConfigService,LlmModelRepository],
})
export class LlmModelModule {}
