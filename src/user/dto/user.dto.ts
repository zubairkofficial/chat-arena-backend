/* eslint-disable @typescript-eslint/no-namespace */
import {  IsEmail,  IsNotEmpty,  IsOptional,  IsString } from "class-validator";

export namespace UserDtos {
  export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    username: string;


    @IsNotEmpty()
    @IsEmail()
    email: string;

    

    @IsOptional()
    @IsString()
    phoneNumber: string;
    
  }
  export class RegisterUserDto  extends CreateUserDto{
  
    @IsNotEmpty()
    @IsString()
    password: string;
    
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
