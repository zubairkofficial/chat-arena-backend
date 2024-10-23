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

  

  findOne(id: string) {
    return `This action returns a #${id} userArena`;
  }

  update(id: string, updateUserArenaDto: UpdateUserArenaDto) {
    return `This action updates a #${id} userArena`;
  }

  remove(id: string) {
    return `This action removes a #${id} userArena`;
  }
}
