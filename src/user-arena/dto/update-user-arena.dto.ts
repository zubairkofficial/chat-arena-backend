import { PartialType } from '@nestjs/mapped-types';
import { CreateUserArenaDto } from './create-user-arena.dto';

export class UpdateUserArenaDto extends PartialType(CreateUserArenaDto) {}
