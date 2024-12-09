import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';

export namespace SystemPromptDto {
  // DTO for creating a system prompt
  export class CreateSystemPromptDto {
    @IsNotEmpty()
    @IsString()
    prompt: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean; // Optional, defaults to true if not provided
  }

  // DTO for updating a system prompt, extending from CreateSystemPromptDto
  export class UpdateSystemPromptDto extends PartialType(CreateSystemPromptDto) {}
}
