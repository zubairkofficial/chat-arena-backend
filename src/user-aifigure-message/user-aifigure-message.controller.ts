import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserAifigureMessageService } from './user-aifigure-message.service';
import { CreateUserAifigureMessageDto } from './dto/create-user-aifigure-message.dto';
import { UpdateUserAifigureMessageDto } from './dto/update-user-aifigure-message.dto';

@Controller('user-aifigure-message')
export class UserAifigureMessageController {
  constructor(private readonly userAifigureMessageService: UserAifigureMessageService) {}

  
  
}
