import { Module } from '@nestjs/common';
import { ArenaService } from './arena.service';
import { ArenaController } from './arena.controller';
import { ArenaTypeRepository } from 'src/arena-type/arena-type.repository';
import { AIFigureRepository } from 'src/aifigure/aifigure.repository';
import { ArenaRepository } from './arena.repository';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';
import { UserRepository } from 'src/user/user.repository';

@Module({
  imports:[UserModule],
  controllers: [ArenaController],
  providers: [ArenaService,AIFigureRepository,ArenaTypeRepository,ArenaRepository,UserService,UserRepository],
})
export class ArenaModule {}
