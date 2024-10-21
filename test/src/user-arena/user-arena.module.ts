import { Module } from '@nestjs/common';
import { UserArenaService } from './user-arena.service';
import { UserArenaController } from './user-arena.controller';

@Module({
  controllers: [UserArenaController],
  providers: [UserArenaService],
})
export class UserArenaModule {}
