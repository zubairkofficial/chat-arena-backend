import { UserArenaRepository } from './user-arena.repository';
import { Injectable } from '@nestjs/common';
import { UpdateUserArenaDto } from './dto/update-user-arena.dto';
import { Arena } from '../arena/entities/arena.entity';
import { User } from '../user/entities/user.entity';
import { UserArena } from './entities/user-arena.entity';
import { BaseService } from '../base/base.service';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class UserArenaService extends BaseService  {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly userArenaRepository: UserArenaRepository,
    dataSource: DataSource,
  ) {
    super(dataSource)
  }
  async createUserArena(arena:Arena,user: User) {
    const transactionScop=this.getTransactionScope()
    const userArena=new UserArena()

    userArena.user=user
    userArena.arena=arena
    transactionScop.add(userArena)
    await transactionScop.commit(this.entityManager)
    return userArena
  }

  

  getUserAndArena(arenaId: string,userId:string) {
    return this.userArenaRepository.getUserAndArena(arenaId,userId).getOne();
  }
  findOne(id: string) {
    return `This action returns a #${id} userArena`;
  }

  update(id: string, updateUserArenaDto: UpdateUserArenaDto) {
    return `This action updates a #${id} userArena`;
  }

  remove(id: string) {
    return `This action removes a #${id} userArena`;
  }

  async removeUserArena(userId: string,arenaId:string) {
    const transactionScop=this.getTransactionScope()
    
   const userArena= await this.getUserAndArena(arenaId,userId)
   transactionScop.delete(userArena)
   await transactionScop.commit(this.entityManager)

    return `userArena remove successfully`;
  }
}
