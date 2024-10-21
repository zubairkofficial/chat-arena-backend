import { Module } from '@nestjs/common';
import { ResponseStyleService } from './response-style.service';
import { ResponseStyleController } from './response-style.controller';

@Module({
  controllers: [ResponseStyleController],
  providers: [ResponseStyleService],
})
export class ResponseStyleModule {}
