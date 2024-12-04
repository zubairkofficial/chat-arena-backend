import { Module } from '@nestjs/common';
import { GoogleAuthService } from './google-auth.service';
import { GoogleAuthController } from './google-auth.controller';
import { UserService } from '../user/user.service';
import { UserRepository } from '../user/user.repository';
import { UserArenaService } from '../user-arena/user-arena.service';
import { UserArenaRepository } from '../user-arena/user-arena.repository';
import { ConfigService } from '@nestjs/config';
import { ErrorLogModule } from '../error-logs/error-logs.module';
import { AIFigureRepository } from '../aifigure/aifigure.repository';
import { ArenaRepository } from '../arena/arena.repository';

@Module({ 
  controllers: [GoogleAuthController],
  providers: [
    GoogleAuthService,
    UserService,
    UserRepository,
    UserArenaService,
    UserArenaRepository,
    ConfigService,
    AIFigureRepository,
    ArenaRepository
  ],
  imports: [ErrorLogModule], // Importing the ErrorLogModule
})
export class GoogleAuthModule {}
