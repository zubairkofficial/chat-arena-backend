import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Req,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '../middleware/auth.middleware';
import { handleServiceError } from '../errors/error-handling';
import { CommonDTOs } from '../common/dto';
import { SubscriptionService } from './subscription.service';
import { SubscriptionDtos } from './dto/subscription.dto';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createSubscription(@Req() req, @Body() createSubscriptionDto: SubscriptionDtos.CreateSubscriptionDto) {
    try {
      const currentUser = req.user as CommonDTOs.CurrentUser; // Access the user object from request

      return await this.subscriptionService.createSubscription(createSubscriptionDto,currentUser);
    } catch (error) {
      handleServiceError(error.errorLogService, HttpStatus.BAD_REQUEST, 'Failed to create subscription');
    }
  }
  @Post("new-card")
  @UseGuards(AuthGuard)
  async createSubscriptionWithNewCard(@Req() req, @Body() input: SubscriptionDtos.CreateSubscriptionWithNewCardDto) {
    try {
      const currentUser = req.user as CommonDTOs.CurrentUser; // Access the user object from request

      return await this.subscriptionService.createSubscriptionWithNewCard(input,currentUser);
    } catch (error) {
      handleServiceError(error.errorLogService, HttpStatus.BAD_REQUEST, 'Failed to create subscription');
    }
  }

  @Get()
  async getAllSubscriptions() {
    try {
      return await this.subscriptionService.getAllSubscriptions();
    } catch (error) {
      handleServiceError(error.errorLogService, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve subscriptions');
    }
  }

  @Get(':id')
  async getSubscriptionById(@Param('id') id: string) {
    try {
      return await this.subscriptionService.getSubscriptionById(id);
    } catch (error) {
      handleServiceError(error.errorLogService, HttpStatus.NOT_FOUND, 'Subscription not found');
    }
  }
  @Get('/join/:userId')
  async getAllSubscriptionsByUserId(@Param('userId') userId: string) {
    try {
      return await this.subscriptionService.getAllSubscriptionsByUserId(userId);
    } catch (error) {
      handleServiceError(error.errorLogService, HttpStatus.NOT_FOUND, 'Subscription not found');
    }
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async updateSubscription(
    @Req() req,
    @Param('id') id: string,
    @Body() updateSubscriptionDto:SubscriptionDtos.UpdateSubscriptionDto,
  ) {
    const currentUser = req.user as CommonDTOs.CurrentUser;
    try {
      if (!currentUser.isAdmin) {
        throw new BadRequestException('Invalid user specified');
      }
      return await this.subscriptionService.updateSubscription(id, updateSubscriptionDto);
    } catch (error) {
      handleServiceError(error.errorLogService, HttpStatus.BAD_REQUEST, 'Failed to update subscription');
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteSubscription(@Param('id') id: string, @Req() req) {
    const currentUser = req.user as CommonDTOs.CurrentUser;
    try {
      if (!currentUser.isAdmin) {
        throw new BadRequestException('Invalid user specified');
      }
      return await this.subscriptionService.deleteSubscription(id);
    } catch (error) {
      handleServiceError(error.errorLogService, HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete subscription');
    }
  }
}
