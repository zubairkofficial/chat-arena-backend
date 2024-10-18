import { Injectable } from '@nestjs/common';
import { CreateUserArenaDto } from './dto/create-user-arena.dto';
import { UpdateUserArenaDto } from './dto/update-user-arena.dto';

@Injectable()
export class UserArenaService {
  create(createUserArenaDto: CreateUserArenaDto) {
    return 'This action adds a new userArena';
  }

  findAll() {
    return `This action returns all userArena`;
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
