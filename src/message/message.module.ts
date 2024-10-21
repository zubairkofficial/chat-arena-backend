import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { MessageRepository } from './message.repository';
import { ConversationService } from '../conversation/conversation.service';
import { ConversationRepository } from '../conversation/conversation.repository';
import { ArenaService } from '../arena/arena.service';
import { ArenaRepository } from '../arena/arena.repository';
import { AIFigureRepository } from '../aifigure/aifigure.repository';
import { ArenaTypeRepository } from '../arena-type/arena-type.repository';
import { UserService } from '../user/user.service';
import { UserRepository } from '../user/user.repository';
import { MessageGateway } from './message.gateway';
import { AIFigureService } from '../aifigure/aifigure.service';
import { LangChainService } from '../langchain/langchain.service';

@Module({
  controllers: [MessageController],
  providers: [MessageGateway,MessageService,MessageRepository,ConversationService,ConversationRepository,ArenaService,ArenaRepository,AIFigureRepository,ArenaTypeRepository,UserService,UserRepository,AIFigureService,LangChainService],
})
export class MessageModule {}
