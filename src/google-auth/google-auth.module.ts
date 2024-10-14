import { Module } from '@nestjs/common';
import { GoogleAuthService } from './google-auth.service';
import { GoogleAuthController } from './google-auth.controller';
import { UserService } from 'src/user/user.service';
import { UserRepository } from 'src/user/user.repository';

@Module({
  controllers: [GoogleAuthController],
  providers: [GoogleAuthService,UserService,UserRepository],
})
export class GoogleAuthModule {}
