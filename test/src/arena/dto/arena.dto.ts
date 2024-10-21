import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDate,
  IsInt,
  IsEnum,
} from 'class-validator';

export namespace ArenaDtos {
  export class CreateArenaDto {
    @IsNotEmpty()
    @IsString()
    name: string; // Arena name must be a non-empty string.

    @IsOptional()
    @IsString()
    description?: string; // Description can be empty but must be a string if provided.

    @IsOptional()
    @IsDate()
    expiryTime?: Date; // Expiry time must be a valid date if provided.

    @IsNotEmpty()
    @IsInt()
    maxParticipants: number; // Participants must be an integer and is required.

    @IsNotEmpty()
    @IsEnum(['open', 'inprogress', 'full'])
    status: 'open' | 'inprogress' | 'full'; // Status must be one of the defined enum values.

    @IsNotEmpty()
    @IsInt()
    arenaTypeId: string; // Reference to a valid ArenaType ID, required.

    @IsNotEmpty()
    @IsInt()
    aiFigureId: string; // Reference to a valid AIFigure ID, required.
  }

  export class UpdateArenaDto {
    name?: string;
    description?: string;
    expiryTime?: Date;
    maxParticipants?: number;
    status?: 'open' | 'inprogress' | 'full';
    arenaTypeId?: string; // Reference to ArenaType
    aiFigureId?: string; // Reference to AIFigure
  }
}