import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { ConversationRepository } from './conversation.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArenaService } from '../arena/arena.service';
import { Conversation } from './entities/conversation.entity';
import { ArenaRepository } from '../arena/arena.repository';
import { AIFigureRepository } from '../aifigure/aifigure.repository';
import { ArenaTypeRepository } from '../arena-type/arena-type.repository';
import { UserService } from '../user/user.service';
import { UserRepository } from '../user/user.repository';
import { UserArenaService } from '../user-arena/user-arena.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation]), // Registering the entity
  ],
  controllers: [ConversationController],
  providers: [ConversationService,ConversationRepository,ArenaService,ArenaRepository,AIFigureRepository,ArenaTypeRepository,UserService,UserRepository,UserArenaService],
})
export class ConversationModule {}
