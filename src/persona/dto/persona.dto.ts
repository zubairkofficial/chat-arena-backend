/* eslint-disable @typescript-eslint/no-namespace */
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export namespace PersonaDto {
  export class CreatePersonaDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    bio: string;
  }
  export class UpdatePersonaDto {
    @IsOptional()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    bio: string;
  }
}
