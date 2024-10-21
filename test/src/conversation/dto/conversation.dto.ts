import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export namespace ConversationDto {
  export class CreateConversationDto {
    @IsNotEmpty()
    @IsString()
    topic: string;

    @IsOptional()
    arenaId?: string; // ID of the arena to which this conversation belongs
  }

  export class UpdateConversationDto {
    @IsOptional()
    @IsString()
    topic?: string;

    @IsOptional()
    arenaId?: string; // ID of the arena to which this conversation belongs
  }
}
