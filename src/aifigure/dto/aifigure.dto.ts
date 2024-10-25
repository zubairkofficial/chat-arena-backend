import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AIFigureType } from '../../common/enums';

export namespace AIFigureDtos {
  export class CreateAIFigureDto {
    @IsNotEmpty()
    @IsString()
    name: string;
  
    @IsOptional() // Image is optional
    @IsString()
    image?: string;
  
    @IsOptional() // Description is optional
    @IsString()
    description?: string;
  
    @IsNotEmpty()
    @IsEnum(AIFigureType) // Ensure type is a valid enum value
    type: AIFigureType;
  
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
