/* eslint-disable @typescript-eslint/no-namespace */
import { IsEnum, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ModelType } from '../../common/enums';

export namespace LlmModelDtos {
  // Create LLM Model DTO
  export class CreateLlmModelDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    apiKey: string;

    @IsEnum(ModelType)
    modelType: ModelType;
  }

  // Update LLM Model DTO
  export class UpdateLlmModelDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    apiKey?: string;

    @IsOptional()
    @IsEnum(ModelType)
    modelType?: ModelType;
  }

  // LLM Model Response DTO (for returning the model data in the response)
  export class LlmModelResponseDto {
    id: number;
    name: string;
    apiKey: string;
    modelType: ModelType;
    createdAt: Date;
    updatedAt: Date;
  }
}
