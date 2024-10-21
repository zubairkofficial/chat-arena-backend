import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { GoogleAuthModule } from './google-auth/google-auth.module';
import { PersonaModule } from './persona/persona.module';
import { ArenaModule } from './arena/arena.module';
import { AifigureModule } from './aifigure/aifigure.module';
import { ConversationModule } from './conversation/conversation.module';
import { MessageModule } from './message/message.module';
import { ReactionModule } from './reaction/reaction.module';
import { ResponseStyleModule } from './response-style/response-style.module';
import { ArenaTypeModule } from './arena-type/arena-type.module';
import { UserArenaModule } from './user-arena/user-arena.module';
import { ScheduleModule } from '@nestjs/schedule';  // Import ScheduleModule for cron jobs
import { LangChainService } from './langchain/langchain.service';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    ScheduleModule.forRoot(), // Enable ScheduleModule for cron jobs
    UserModule,
    GoogleAuthModule,
    PersonaModule,
    ArenaModule,
    AifigureModule,
    ConversationModule,
    MessageModule,
    ReactionModule,
    ResponseStyleModule,
    ArenaTypeModule,
    UserArenaModule,
  ],
  controllers: [AppController],
  providers: [AppService,LangChainService],
})
export class AppModule {}
