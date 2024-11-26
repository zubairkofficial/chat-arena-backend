import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Delete,
  HttpStatus,
  Req,
  UseGuards,
  Put,
} from '@nestjs/common';
import { CardService } from './card.service';
import { CommonDTOs } from '../common/dto';
import { CardDtos } from '../payment/dto/payment.dto';
import { AuthGuard } from '../middleware/auth.middleware';
import { handleServiceError } from '../errors/error-handling'; // Import the utility for error handling

@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post('create-card')
  @UseGuards(AuthGuard)
  async createCard(@Body() input: CardDtos.CreateCardInputDto, @Req() req) {
    const currentUser = req.user as CommonDTOs.CurrentUser;
    try {
      return await this.cardService.createCard(currentUser, input); // Pass the user and input to the service
    } catch (error) {
      handleServiceError(error.errorLogService, HttpStatus.BAD_REQUEST, 'Failed to create card');
    }
  }
  @Post('existing-card')
  @UseGuards(AuthGuard)
  async existingCard(@Req() req, @Body() input: CardDtos.ExisitngCardInputDto,@Param('id') id: string,) {
    try {
    const currentUser = req.user as CommonDTOs.CurrentUser;

      
      return await this.cardService.existingCard(input,id,currentUser); // Pass the user and input to the service
    } catch (error) {
      handleServiceError(error.errorLogService, HttpStatus.BAD_REQUEST, 'Failed to create card');
    }
  }

  @Get('list')
  @UseGuards(AuthGuard)
  async getAllCard(@Req() req) {
    try {
      const currentUser = req.user as CommonDTOs.CurrentUser;
  
      return await this.cardService.getAllCard(currentUser); // Call the service to get all cards
    } catch (error) {
      handleServiceError(error.errorLogService, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve cards');
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.cardService.findAll(); // Call the service to get all cards
    } catch (error) {
      handleServiceError(error.errorLogService, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve cards');
    }
  }

 

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.cardService.remove(+id); // Call the service to remove a card by ID
    } catch (error) {
      handleServiceError(error.errorLogService, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete card');
    }
  }
}
