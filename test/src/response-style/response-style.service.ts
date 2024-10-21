import { Injectable } from '@nestjs/common';
import { CreateResponseStyleDto } from './dto/create-response-style.dto';
import { UpdateResponseStyleDto } from './dto/update-response-style.dto';

@Injectable()
export class ResponseStyleService {
  create(createResponseStyleDto: CreateResponseStyleDto) {
    return 'This action adds a new responseStyle';
  }

  findAll() {
    return `This action returns all responseStyle`;
  }

  findOne(id: string) {
    return `This action returns a #${id} responseStyle`;
  }

  update(id: string, updateResponseStyleDto: UpdateResponseStyleDto) {
    return `This action updates a #${id} responseStyle`;
  }

  remove(id: string) {
    return `This action removes a #${id} responseStyle`;
  }
}
