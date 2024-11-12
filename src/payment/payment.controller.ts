import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CardDtos } from './dto/payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

 

  @Post('/create-cardholder')
  async createCardholder(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('phone') phone: string,
  ) {
    const cardholder = await this.paymentService.createCardholder(
      name,
      email,
      phone,
    );
    return cardholder;
  }

  // @Post('/create-card/:id')
  // async createCard(
  //   @Body() input: CardDtos.CreateCardInputDto,
  // ) {
  //   const card = await this.paymentService.createCard(input);
  //   return card;
  // }
}

// import { Controller, Post, Get, Put, Delete, Body, Param,  Res } from '@nestjs/common';
// import {  Response } from 'express';
// import { PaymentService } from './payment.service';

// @Controller('payment-cards')
// export class PaymentController {
//     constructor(private readonly cardService: PaymentService) {}

//     @Post('create/:id')
//     async createCard(@Param('id') customerId: string, @Body() cardData: any, @Res() res: Response, ) {
//         try {
//             const card = await this.cardService.createCard(customerId, cardData);
//             return res.status(200).json({ message: "Card created successfully", card });
//         } catch (error) {
//            throw new Error(error.message)
//         }
//     }

//     @Get(':id')
//     async showCard(@Param('id') customerId: string, @Body('card_id') cardId: string, @Res() res: Response, ) {
//         try {
//             const card = await this.cardService.retrieveCard(customerId, cardId);
//             return res.status(200).json({ message: "Card retrieved successfully", card });
//         } catch (error) {

//         }
//     }

//     @Put(':id')
//     async updateCard(@Param('id') customerId: string, @Body() updateData: any, @Res() res: Response, ) {
//         try {
//             const card = await this.cardService.updateCard(customerId, updateData.card_id, updateData.address_city);
//             return res.status(200).json({ message: "Card updated successfully", card });
//         } catch (error) {

//         }
//     }

//     @Delete(':id')
//     async deleteCard(@Param('id') customerId: string, @Res() res: Response, ) {
//         try {
//             const result = await this.cardService.deleteCard(customerId);
//             return res.status(200).json({ message: "Card deleted successfully", result });
//         } catch (error) {

//         }
//     }
// }
