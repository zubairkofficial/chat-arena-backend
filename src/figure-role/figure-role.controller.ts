import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FigureRoleService } from './figure-role.service';
import { CreateFigureRoleDto } from './dto/create-figure-role.dto';
import { UpdateFigureRoleDto } from './dto/update-figure-role.dto';

@Controller('figure-role')
export class FigureRoleController {
  constructor(private readonly figureRoleService: FigureRoleService) {}

  @Post()
  create(@Body() createFigureRoleDto: CreateFigureRoleDto) {
    return this.figureRoleService.create(createFigureRoleDto);
  }

  @Get()
  findAll() {
    return this.figureRoleService.findAll();
  }

  @Get(':id')
  figureRoleById(@Param('id') id: string) {
    return this.figureRoleService.figureRoleById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFigureRoleDto: UpdateFigureRoleDto) {
    return this.figureRoleService.update(+id, updateFigureRoleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.figureRoleService.remove(+id);
  }
}
