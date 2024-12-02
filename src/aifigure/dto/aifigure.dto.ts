import { ArrayNotEmpty, IsArray, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
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

    @IsOptional()
    @IsBoolean()
    isAiPrivate: boolean; // Participants must be an integer and is required.

    @IsArray()
    @IsOptional() // This means the field is optional
    @IsString({ each: true }) // Ensures that every item in the array is a string
    @ArrayNotEmpty() // Optionally ensures the array is not empty if required
    llmModel: string[];
    
  }

  export class UpdateAIFigureDto {
    @IsString()
    name?: string;

    @IsString()
    role?: string;


    @IsOptional() // Image is optional
    @IsString()
    image?: string;

    
    @IsString()
    prompt?: string;

    @IsOptional()
    @IsBoolean()
    isAiPrivate?: boolean;
  }
  export class MessageDto {
    @IsString()
    message: string;

   
  }
}
