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
import { MessageModule } from './message/message.module';
import { ReactionModule } from './reaction/reaction.module';
import { ArenaTypeModule } from './arena-type/arena-type.module';
import { UserArenaModule } from './user-arena/user-arena.module';
import { ScheduleModule } from '@nestjs/schedule';  // Import ScheduleModule for cron jobs
import { LangChainService } from './langchain/langchain.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { FigureRoleModule } from './figure-role/figure-role.module';
import { UserAifigureMessageModule } from './user-aifigure-message/user-aifigure-message.module';
import { ErrorLogModule } from './error-logs/error-logs.module';
import { PaymentModule } from './payment/payment.module';
import { PackageBundlesModule } from './package-bundle/package-bundle.module';
import { CardModule } from './card/card.module';
import { TransactionModule } from './transaction/transaction.module';
import { LlmModelModule } from './llm-model/llm-model.module';
import { SubscriptionModule } from './subscription/subscription.module';
@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads', // Files will be accessible via /uploads
    }),
    TypeOrmModule.forRoot(databaseConfig),
    ScheduleModule.forRoot(), // Enable ScheduleModule for cron jobs
    UserModule,
    GoogleAuthModule,
    PersonaModule,
    ArenaModule,
    AifigureModule,
    MessageModule,
    ReactionModule,
    ArenaTypeModule,
    UserArenaModule,
    FigureRoleModule,
    UserAifigureMessageModule,
    ErrorLogModule,
    PaymentModule,
    PackageBundlesModule,
    CardModule,
    TransactionModule,
    LlmModelModule,
    SubscriptionModule,
  ],
  controllers: [AppController],
  providers: [AppService,LangChainService],
})
export class AppModule {}
