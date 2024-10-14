import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { GoogleAuthModule } from './google-auth/google-auth.module';

@Module({
  imports: [TypeOrmModule.forRoot(databaseConfig),UserModule, GoogleAuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
