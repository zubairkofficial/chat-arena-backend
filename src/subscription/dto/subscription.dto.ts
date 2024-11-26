/* eslint-disable @typescript-eslint/no-namespace */
import {
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    IsNumber,
    Min,
    IsBoolean,
    IsDate,
    Length,
  } from 'class-validator';
  
  export namespace SubscriptionDtos {
    export class CreateSubscriptionWithNewCardDto {
      @IsNotEmpty()
      @IsString()
      @Length(13, 19) // Card numbers typically range from 13 to 19 digits
      cardNumber: string;
  
      @IsNotEmpty()
      @IsString()
      @Length(2, 2) // Month should be two digits
      expMonth: string;
  
      @IsNotEmpty()
      @IsString()
      @Length(4, 4) // Year should be four digits
      expYear: string;
  

      @IsNotEmpty()
      @IsNumber()
      @Min(0)
      coins: number; // Optional: Update the token count for the subscription
  
      @IsNotEmpty()
      @IsNumber()
      @Min(0)
      price: number; // Optional: Update the token count for the subscription
  

      @IsNotEmpty()
      @IsString()
      @Length(3, 4) // CVC can be 3 or 4 digits
      cvc: string;

      @IsNotEmpty()
      @IsUUID()
      packageId: string; // The package bundle associated with the subscription
  
      @IsOptional()
      @IsBoolean()
      status?: boolean; // Status of the subscription, defaults to active
    }
    export class CreateSubscriptionDto {
      @IsNotEmpty()
      @IsUUID()
      cardId: string;

      @IsNotEmpty()
      @IsUUID()
      packageId: string; // The package bundle associated with the subscription
  
      @IsOptional()
      @IsBoolean()
      status?: boolean; // Status of the subscription, defaults to active
    }
  
    export class UpdateSubscriptionDto {
     
      @IsOptional()
      @IsUUID()
      packageId?: string; // Optional: Update the package associated with the subscription
  
      @IsOptional()
      @IsNumber()
      @Min(0)
      coins?: number; // Optional: Update the token count for the subscription
  
      @IsOptional()
      @IsNumber()
      @Min(0)
      price?: number; // Optional: Update the token count for the subscription
  
      @IsOptional()
      @IsDate()
      startDate?: Date; // Optional: Update the subscription start date
  
      @IsOptional()
      @IsDate()
      endDate?: Date; // Optional: Update the subscription end date
  
      @IsOptional()
      @IsBoolean()
      status?: boolean; // Optional: Update the subscription status
    }
  
    export class DeleteSubscriptionDto {
      @IsNotEmpty()
      @IsUUID()
      id: string; // ID of the subscription to delete
    }
  }
  