import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { GoogleStrategy } from '../config/google.strategy';
import { UserArenaService } from '../user-arena/user-arena.service';
import { UserArenaRepository } from '../user-arena/user-arena.repository';
@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository, GoogleStrategy,UserArenaService,UserArenaRepository],
})
export class UserModule {}
