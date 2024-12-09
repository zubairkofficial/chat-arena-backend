import { Module } from '@nestjs/common';
import { SystemPromptService } from './system-prompt.service';
import { SystemPromptController } from './system-prompt.controller';
import { SystemPromptRepository } from './system-prompt.repository';

@Module({
  controllers: [SystemPromptController],
  providers: [SystemPromptService,SystemPromptRepository],
  exports: [SystemPromptService, SystemPromptRepository], 
})
export class SystemPromptModule {}
