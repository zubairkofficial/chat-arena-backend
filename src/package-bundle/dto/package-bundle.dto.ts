/* eslint-disable @typescript-eslint/no-namespace */
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';

export namespace PackageBundleDtos {
  export class CreatePackageBundleDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    price: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    coins: number;

    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true }) // Validate each element in the array as a string
    featureNames: string[];

    @IsNotEmpty()
    @IsNumber()
    @Min(1) // Duration must be at least 1 day
    durationInDays: number;
  }

  export class UpdatePackageBundleDto {
    @IsOptional()
    @IsString()
    name: string;


    
    @IsOptional()
    @IsString()
    description: string;
    
    @IsOptional()
    @IsNumber()
    @Min(0)
    price: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    coins: number;

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true }) // Validate each element in the array as a string
    featureNames: string[];

    @IsOptional()
    @IsNumber()
    @Min(1) // Duration must be at least 1 day
    durationInDays: number;
  }

  export class DeletePackageBundleDto {
    @IsNotEmpty()
    @IsString() // Changed to string for UUID compatibility
    id: string;
  }
}
