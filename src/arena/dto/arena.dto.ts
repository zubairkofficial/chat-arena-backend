import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDate,
  IsInt,
  IsEnum,
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsUUID,
  IsBoolean,
  ArrayNotEmpty,
} from 'class-validator';

export namespace ArenaDtos {
  export class CreateArenaDto {
    @IsNotEmpty()
    @IsString()
    name: string; // Arena name must be a non-empty string.

    
    @IsNotEmpty()
    @IsString()
    image: string;
    
    @IsOptional()
    @IsString()
    description?: string; // Description can be empty but must be a string if provided.

    @IsOptional()
    expiryTime?: Date|string; // Expiry time must be a valid date if provided.

    @IsNotEmpty()
    @IsInt()
    maxParticipants: number; // Participants must be an integer and is required.
 
    @IsOptional()
    @IsBoolean()
    isPrivate: boolean; // Participants must be an integer and is required.

    @IsNotEmpty()
    @IsEnum(['open', 'inprogress', 'full'])
    status: 'open' | 'inprogress' | 'full'; // Status must be one of the defined enum values.

    @IsNotEmpty()
    @IsInt()
    arenaTypeId: string; // Reference to a valid ArenaType ID, required.


    @IsNotEmpty()
    @IsArray()
    @IsUUID('all', { each: true })
    aiFigureRoles: string[];


    @IsArray()
    @IsOptional() // This means the field is optional
    @IsString({ each: true }) // Ensures that every item in the array is a string
    @ArrayNotEmpty() // Optionally ensures the array is not empty if required
    arenaModel?: string[];

    @IsNotEmpty()
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(3)
    @IsUUID('all', { each: true })
    aiFigureId: string[]; 
  }
  export class JoinArenaDto {
    @IsNotEmpty()
    @IsString()
    arenaId: string; 

    
  }

  export class UpdateArenaDto {
    @IsOptional()
    @IsString()
    name?: string;
  
    @IsOptional()
    @IsString()
    description?: string;
  
    @IsOptional()
    @IsString()
    expiryTime?: Date|string;
  
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    maxParticipants?: number;
  
    @IsOptional()
    @IsNotEmpty()
    status?: 'open' | 'inprogress' | 'full';  // Enum for status
  
    @IsOptional()
    @IsUUID() // Reference to ArenaType (validate that it's a valid UUID)
    arenaTypeId?: string;
  

    @IsNotEmpty()
    @IsArray()
    @IsUUID('all', { each: true })
    aiFigureRoles: string[];

    @IsNotEmpty()  // Makes sure the aiFigureId array is required
    @IsArray()
    @ArrayMinSize(1)  // Minimum size of 1 element
    @ArrayMaxSize(3)  // Maximum size of 3 elements (optional)
    @IsUUID('all', { each: true }) // Ensures that each element in the array is a valid UUID
    aiFigureId: string[];  // Array of AiFigure IDs
  
    @IsOptional()
    @IsBoolean() // Validate if it's a boolean value
    isPrivate?: boolean;
  
    @IsNotEmpty()
    @IsString()
    image: string;
    
    @IsOptional()
    @IsArray()
    @IsString({ each: true }) // Ensures each element in the array is a string
    @ArrayNotEmpty()  // Ensures the array is not empty
    arenaModel?: string[]; // Array of arena model strings (optional)
  }
}
