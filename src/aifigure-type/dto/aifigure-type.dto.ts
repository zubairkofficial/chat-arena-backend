import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export namespace AifigureTypeDto {
  export class CreateAifigureTypeDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;
  }

  export class UpdateAifigureTypeDto extends PartialType(CreateAifigureTypeDto) {}
}
