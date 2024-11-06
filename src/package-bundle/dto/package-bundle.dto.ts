/* eslint-disable @typescript-eslint/no-namespace */
import {
    IsNotEmpty,
    IsOptional,
    IsString,
    IsNumber,
    Min,
  } from 'class-validator';
  
  export namespace PackageBundleDtos {
    export class CreatePackageBundleDto {
      @IsNotEmpty()
      @IsString()
      name: string;
  
      @IsNotEmpty()
      @IsNumber()
      @Min(0)
      price: number;
  
      @IsNotEmpty()
      @IsNumber()
      @Min(0)
      coins: number;
    }
  
    export class UpdatePackageBundleDto {
      @IsOptional()
      @IsString()
      name: string;
  
      @IsOptional()
      @IsNumber()
      @Min(0)
      price: number;
  
      @IsOptional()
      @IsNumber()
      @Min(0)
      coins: number;
    }
  
    export class DeletePackageBundleDto {
      @IsNotEmpty()
      @IsNumber()
      id: number;
    }
  }
  