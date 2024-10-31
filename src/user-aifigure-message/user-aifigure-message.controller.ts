import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserAifigureMessageService } from './user-aifigure-message.service';
import { CreateUserAifigureMessageDto } from './dto/create-user-aifigure-message.dto';
import { UpdateUserAifigureMessageDto } from './dto/update-user-aifigure-message.dto';

@Controller('user-aifigure-message')
export class UserAifigureMessageController {
  constructor(private readonly userAifigureMessageService: UserAifigureMessageService) {}

  @Post()
  create(@Body() createUserAifigureMessageDto: CreateUserAifigureMessageDto) {
    return this.userAifigureMessageService.create(createUserAifigureMessageDto);
  }

  @Get()
  findAll() {
    return this.userAifigureMessageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userAifigureMessageService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserAifigureMessageDto: UpdateUserAifigureMessageDto) {
    return this.userAifigureMessageService.update(+id, updateUserAifigureMessageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userAifigureMessageService.remove(+id);
  }
}
