/* eslint-disable @typescript-eslint/no-namespace */
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ArenaRequestStatus, UserTier } from '../../common/enums';

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

  export class RegisterUserDto extends CreateUserDto {
    @IsNotEmpty()
    @IsString()
    password: string;
  }
  export class ResentUserDto extends CreateUserDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;
  }
  export class LoginDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;
  }

  export class UpdateUser {
    @IsOptional()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    image: string;

    @IsOptional()
    @IsString()
    username: string;

    @IsOptional()
    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    phoneNumber: string;

    @IsOptional()
    @IsNumber()
    availableCoins: number;

    @IsOptional()  // Make the status optional if you're allowing the admin to update it
  @IsString()
  status: ArenaRequestStatus; // Ensure status is a valid ArenaRequestStatus
  }
  export class UpdateUserTier {
    @IsOptional()
    @IsString()
    tier: UserTier;

    
  }

  export class ForgotPasswordDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;
  }

  export class ResetPasswordDto {
    @IsNotEmpty()
    @IsString()
    token: string; // Reset token

    @IsNotEmpty()
    @MinLength(6)
    @IsString()
    newPassword: string; // New password
  }
  export class ChangePasswordDto{
    @IsNotEmpty()
    @IsString()
    oldPassword: string; // Reset token

    @IsNotEmpty()
    @MinLength(6)
    @IsString()
    newPassword: string; // New password
  }
}
