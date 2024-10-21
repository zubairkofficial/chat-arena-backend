import { Injectable } from '@nestjs/common';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { UpdateReactionDto } from './dto/update-reaction.dto';

@Injectable()
export class ReactionService {
  create(createReactionDto: CreateReactionDto) {
    return 'This action adds a new reaction';
  }

  findAll() {
    return `This action returns all reaction`;
  }

  findOne(id: string) {
    return `This action returns a #${id} reaction`;
  }

  update(id: string, updateReactionDto: UpdateReactionDto) {
    return `This action updates a #${id} reaction`;
  }

  remove(id: string) {
    return `This action removes a #${id} reaction`;
  }
}
