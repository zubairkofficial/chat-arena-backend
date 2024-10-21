import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { ConversationRepository } from './conversation.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArenaService } from 'src/arena/arena.service';
import { Conversation } from './entities/conversation.entity';
import { ArenaRepository } from 'src/arena/arena.repository';
import { AIFigureRepository } from 'src/aifigure/aifigure.repository';
import { ArenaTypeRepository } from 'src/arena-type/arena-type.repository';
import { UserService } from 'src/user/user.service';
import { UserRepository } from 'src/user/user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation]), // Registering the entity
  ],
  controllers: [ConversationController],
  providers: [ConversationService,ConversationRepository,ArenaService,ArenaRepository,AIFigureRepository,ArenaTypeRepository,UserService,UserRepository],
})
export class ConversationModule {}
