import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { MessageRepository } from './message.repository';
import { ConversationService } from 'src/conversation/conversation.service';
import { ConversationRepository } from 'src/conversation/conversation.repository';
import { ArenaService } from 'src/arena/arena.service';
import { ArenaRepository } from 'src/arena/arena.repository';
import { AIFigureRepository } from 'src/aifigure/aifigure.repository';
import { ArenaTypeRepository } from 'src/arena-type/arena-type.repository';
import { UserService } from 'src/user/user.service';
import { UserRepository } from 'src/user/user.repository';
import { MessageGateway } from './message.gateway';
import { AIFigureService } from 'src/aifigure/aifigure.service';
import { LangChainService } from 'src/langchain/langchain.service';

@Module({
  controllers: [MessageController],
  providers: [MessageGateway,MessageService,MessageRepository,ConversationService,ConversationRepository,ArenaService,ArenaRepository,AIFigureRepository,ArenaTypeRepository,UserService,UserRepository,AIFigureService,LangChainService],
})
export class MessageModule {}
