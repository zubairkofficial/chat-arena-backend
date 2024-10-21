import { IsNotEmpty, IsString } from 'class-validator';

export namespace AIFigureDtos {
  export class CreateAIFigureDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    role: string; // The Instructor, The Moderator, etc.

    @IsNotEmpty()
    @IsString()
    prompt: string;
  }

  export class UpdateAIFigureDto {
    @IsString()
    name?: string;

    @IsString()
    role?: string;

    @IsString()
    prompt?: string;
  }
}
