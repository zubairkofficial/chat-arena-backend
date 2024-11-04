import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { GoogleStrategy } from '../config/google.strategy';
import { UserArenaService } from '../user-arena/user-arena.service';
import { UserArenaRepository } from '../user-arena/user-arena.repository';
import { ConfigService } from '@nestjs/config';
import { ErrorLogModule } from '../error-logs/error-logs.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [
    forwardRef(() => PaymentModule), 
    TypeOrmModule.forFeature([UserRepository, UserArenaRepository]), // Import your repositories here
    ErrorLogModule, // Import the ErrorLogModule here
  ],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    GoogleStrategy,
    UserArenaService,
    ConfigService,
  ],
  exports: [UserRepository],
})
export class UserModule {}
