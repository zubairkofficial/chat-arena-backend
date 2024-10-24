import { Module } from '@nestjs/common';
import { ArenaService } from './arena.service';
import { ArenaController } from './arena.controller';
import { ArenaTypeRepository } from '../arena-type/arena-type.repository';
import { AIFigureRepository } from '../aifigure/aifigure.repository';
import { ArenaRepository } from './arena.repository';
import { UserService } from '../user/user.service';
import { UserModule } from '../user/user.module';
import { UserRepository } from '../user/user.repository';
import { UserArenaService } from '../user-arena/user-arena.service';
import { UserArenaRepository } from '../user-arena/user-arena.repository';

@Module({
  imports: [UserModule],
  controllers: [ArenaController],
  providers: [
    ArenaService,
    AIFigureRepository,
    ArenaTypeRepository,
    ArenaRepository,
    UserService,
    UserRepository,
    UserArenaService,
    UserArenaRepository
  ],
})
export class ArenaModule {}
