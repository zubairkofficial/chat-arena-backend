import { FigureRoleRepository } from './figure-role.repository';
import { Injectable } from '@nestjs/common';
import { CreateFigureRoleDto } from './dto/create-figure-role.dto';
import { UpdateFigureRoleDto } from './dto/update-figure-role.dto';

@Injectable()
export class FigureRoleService {
  constructor(private readonly figureRoleRepository:FigureRoleRepository){}
  create(createFigureRoleDto: CreateFigureRoleDto) {
    return 'This action adds a new figureRole';
  }

  findAll() {
    return this.figureRoleRepository.find();
  }

  figureRoleById(id: string) {
    return this.figureRoleRepository.findOne({where:{id}});
  }

  update(id: number, updateFigureRoleDto: UpdateFigureRoleDto) {
    return `This action updates a #${id} figureRole`;
  }

  remove(id: number) {
    return `This action removes a #${id} figureRole`;
  }
}
