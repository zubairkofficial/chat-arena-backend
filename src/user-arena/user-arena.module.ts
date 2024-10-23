import { Module } from '@nestjs/common';
import { UserArenaService } from './user-arena.service';
import { UserArenaController } from './user-arena.controller';
import { UserArenaRepository } from './user-arena.repository';

@Module({
  controllers: [UserArenaController],
  providers: [UserArenaService,UserArenaRepository],
})
export class UserArenaModule {}
