/* eslint-disable @typescript-eslint/no-namespace */
import { IsNotEmpty, IsString, IsNumber, Length, IsEnum, IsInt, IsPositive } from 'class-validator';

export namespace CardDtos {
  
  // DTO for creating a card token with card details
  export class CreateCardInputDto {
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
    @IsString()
    @Length(3, 4) // CVC can be 3 or 4 digits
    cvc: string;


    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    price: number; // Price of the coins in dollars (e.g., 0.5, 1.0)

    @IsNotEmpty()
    @IsInt()
    coins: number; // Coins purchased (100, 200, or 1000)
  }
  export class ExisitngCardInputDto {
    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    price: number; // Price of the coins in dollars (e.g., 0.5, 1.0)

    @IsNotEmpty()
    @IsInt()  
    coins: number; 
  }

  // DTO for customer parameters such as customer ID
  export class CustomerParamsDto {
    @IsNotEmpty()
    @IsString() // Assuming the customer ID is a string (Stripe IDs are strings)
    id: string;
  }
}
