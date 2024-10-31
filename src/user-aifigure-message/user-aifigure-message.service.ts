import { Injectable } from '@nestjs/common';
import { CreateUserAifigureMessageDto } from './dto/create-user-aifigure-message.dto';
import { UpdateUserAifigureMessageDto } from './dto/update-user-aifigure-message.dto';

@Injectable()
export class UserAifigureMessageService {
  create(createUserAifigureMessageDto: CreateUserAifigureMessageDto) {
    return 'This action adds a new userAifigureMessage';
  }

  findAll() {
    return `This action returns all userAifigureMessage`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userAifigureMessage`;
  }

  update(id: number, updateUserAifigureMessageDto: UpdateUserAifigureMessageDto) {
    return `This action updates a #${id} userAifigureMessage`;
  }

  remove(id: number) {
    return `This action removes a #${id} userAifigureMessage`;
  }
}
