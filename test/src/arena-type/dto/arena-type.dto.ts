import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export namespace ArenaTypeDto {
  export class CreateArenaTypeDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsOptional()
    @IsString()
    prompt?: string;
  }
  export class UpdateArenaTypeDto extends PartialType(CreateArenaTypeDto) {}
}
