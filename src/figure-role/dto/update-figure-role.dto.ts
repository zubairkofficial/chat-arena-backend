import { PartialType } from '@nestjs/mapped-types';
import { CreateFigureRoleDto } from './create-figure-role.dto';

export class UpdateFigureRoleDto extends PartialType(CreateFigureRoleDto) {}
