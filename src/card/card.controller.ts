import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { CardService } from './card.service';
import { CommonDTOs } from '../common/dto';
import { CardDtos } from '../payment/dto/payment.dto';
import { AuthGuard } from '../middleware/auth.middleware';

@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post('create-card')
  @UseGuards(AuthGuard)
  createCard(@Body() input: CardDtos.CreateCardInputDto ,@Req() req) {
    const currentUser = req.user as CommonDTOs.CurrentUser;

    return this.cardService.createCard(currentUser,input);
  }

  @Get()
  findAll() {
    return this.cardService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cardService.findOne(+id);
  }

 

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cardService.remove(+id);
  }
}
