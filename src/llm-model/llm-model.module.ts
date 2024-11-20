import { Module } from '@nestjs/common';
import { LlmModelService } from './llm-model.service';
import { LlmModelController } from './llm-model.controller';
import { UserService } from '../user/user.service';
import { UserRepository } from '../user/user.repository';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [LlmModelController],
  providers: [LlmModelService,UserService,UserRepository,ConfigService],
})
export class LlmModelModule {}
