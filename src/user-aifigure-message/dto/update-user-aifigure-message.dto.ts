import { PartialType } from '@nestjs/mapped-types';
import { CreateUserAifigureMessageDto } from './create-user-aifigure-message.dto';

export class UpdateUserAifigureMessageDto extends PartialType(CreateUserAifigureMessageDto) {}
