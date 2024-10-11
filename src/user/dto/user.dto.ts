/* eslint-disable @typescript-eslint/no-namespace */
import {  IsEmail,  IsNotEmpty,  IsOptional,  IsString } from "class-validator";

export namespace UserDtos {
  export class RegisterDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    username: string;


    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;

    @IsOptional()
    @IsString()
    phoneNumber: string;
    
  }
  export class LoginDto {
    
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;
    
  }
}
