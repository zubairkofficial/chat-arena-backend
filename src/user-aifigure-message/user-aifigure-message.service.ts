import { Injectable } from '@nestjs/common';
import { CreateUserAifigureMessageDto } from './dto/create-user-aifigure-message.dto';
import { UpdateUserAifigureMessageDto } from './dto/update-user-aifigure-message.dto';
import { DataSource, EntityManager } from 'typeorm';
import { BaseService } from '../base/base.service';
import { UserAifigureMessage } from './entities/user-aifigure-message.entity';
import { AIFigure } from '../aifigure/entities/aifigure.entity';
import { CommonDTOs } from '../common/dto';
import { UserService } from '../user/user.service';
import { UserAifigureMessageRepository } from './user-aifigure-message.repository';

@Injectable()
export class UserAifigureMessageService extends BaseService {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly userService: UserService,
    private readonly userAifigureMessageRepository: UserAifigureMessageRepository,
    dataSource:DataSource
  ){
    super(dataSource)
  }
  async createUserAiFigure(aiFigure: AIFigure,sendMessage: string,receiveMessage: string,currentUser: CommonDTOs.CurrentUser) {
    const transactionScop=this.getTransactionScope()
    const user= await this.userService.getUserById(currentUser.id)
   const userAifigureMessage=new UserAifigureMessage
   userAifigureMessage.sendMessage=sendMessage
   userAifigureMessage.receiveMessage=receiveMessage
   userAifigureMessage.aiFigure=aiFigure
   userAifigureMessage.user=user

   transactionScop.add(userAifigureMessage)
   await transactionScop.commit(this.entityManager)
   
    return userAifigureMessage;
  }
 
 async deleteUserAiFigure(id: string) {
    
const userAiFigure=await this.userAifigureMessageRepository.getUserAiFigureById(id).getMany()

return userAiFigure
  }
  
 async getPreviousMessage(id: string,limit: number) {
  return await this.userAifigureMessageRepository.find({
    where: {
      aiFigure: {
        id,
      },
    },
    take: limit,
    order: {
      createdAt: 'DESC',
    },
  });
  }
  async getPreviousMessageUserById(id: string, userId: string) {
    return await this.userAifigureMessageRepository.find({
      where: {
        aiFigure: {
          id,
        },
        user: {
          id: userId,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }
  
}
