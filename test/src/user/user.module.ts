import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { GoogleStrategy } from '../config/google.strategy';
@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository, GoogleStrategy],
})
export class UserModule {}
