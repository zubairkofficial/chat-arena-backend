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
import { UserArenaService } from '../user-arena/user-arena.service';
import { UserArenaRepository } from '../user-arena/user-arena.repository';
import { ConfigService } from '@nestjs/config';
import { ErrorLogModule } from '../error-logs/error-logs.module';
import { FigureRoleService } from '../figure-role/figure-role.service';
import { FigureRoleRepository } from '../figure-role/figure-role.repository';
import { UserAifigureMessageService } from '../user-aifigure-message/user-aifigure-message.service';
import { UserAifigureMessageRepository } from '../user-aifigure-message/user-aifigure-message.repository';
import { ArenaAiFigureRepository } from '../arena-ai-figure/arena-ai-figure.repository';
import { LlmModelService } from '../llm-model/llm-model.service';

@Module({
  controllers: [MessageController],
  providers: [MessageGateway,MessageService,MessageRepository,ConversationService,ConversationRepository,ArenaService,ArenaRepository,AIFigureRepository,ArenaTypeRepository,UserService,UserRepository,AIFigureService,LangChainService,UserArenaService,UserArenaRepository,ConfigService,FigureRoleService,FigureRoleRepository,UserAifigureMessageService,UserAifigureMessageRepository,ArenaAiFigureRepository,LlmModelService],
  imports: [ErrorLogModule],

})
export class MessageModule {}
