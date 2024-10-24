import { Module } from '@nestjs/common';
import { GoogleAuthService } from './google-auth.service';
import { GoogleAuthController } from './google-auth.controller';
import { UserService } from '../user/user.service';
import { UserRepository } from '../user/user.repository';
import { UserArenaService } from '../user-arena/user-arena.service';
import { UserArenaRepository } from '../user-arena/user-arena.repository';

@Module({
  controllers: [GoogleAuthController],
  providers: [GoogleAuthService, UserService, UserRepository,UserArenaService,UserArenaRepository],
})
export class GoogleAuthModule {}
