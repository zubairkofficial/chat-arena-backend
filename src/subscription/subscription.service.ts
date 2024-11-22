import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {  DataSource, EntityManager } from 'typeorm';
import { UserService } from '../user/user.service';
import { PackageBundle } from '../package-bundle/entities/package-bundle.entity';
import { AllExceptionsFilter } from '../errors/http-exception.filter';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionDtos } from './dto/subscription.dto';
import { BaseService } from '../base/base.service';
import { SubscriptionRepository } from './subscription.repository';
import { CommonDTOs } from '../common/dto';
import { CardRepository } from '../card/card.repository';
import { PaymentService } from '../payment/payment.service';

@Injectable()
export class SubscriptionService extends BaseService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: SubscriptionRepository,
    private userService: UserService,
    private entityManager: EntityManager,
    private readonly cardRepository: CardRepository,
    private readonly paymentService: PaymentService,


    dataSource: DataSource,
  ) {
    super(dataSource);
  }

 
  async createSubscriptionWithNewCard(
    input: SubscriptionDtos.CreateSubscriptionWithNewCardDto,currentUser: CommonDTOs.CurrentUser
  ): Promise<Subscription> {

    // Validate user
    const user = await this.userService.getUserById(currentUser.id);
    if (!user) {
      throw new NotFoundException(`User with ID ${currentUser.id} not found.`);
    }
   
    // Validate package bundle
    const packageBundle = await this.entityManager.findOne(PackageBundle, {
      where: { id: input.packageId },
    });
    if (!packageBundle) {
      throw new NotFoundException(`Package bundle with ID ${input.packageId} not found.`);
    }

    const cardInput = {
      cardNumber: input.cardNumber,
      expMonth: input.expMonth.toString(),
      expYear: input.expYear.toString(),
      cvc: input.cvc.toString(),
      coins: packageBundle.coins,
      price: packageBundle.price,
    };

    const subscription = this.subscriptionRepository.create({
      user,
      packageBundle,
      coins:  packageBundle.coins, // Default to package coins
      startDate:  new Date(),
      endDate:  this.calculateEndDate(packageBundle.durationInDays),
    });

    try {
      await this.paymentService.createCard(cardInput) 
      return await this.subscriptionRepository.save(subscription);
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }
  async createSubscription(
    input: SubscriptionDtos.CreateSubscriptionDto,currentUser: CommonDTOs.CurrentUser
  ): Promise<Subscription> {

    // Validate user
    const user = await this.userService.getUserById(currentUser.id);
    if (!user) {
      throw new NotFoundException(`User with ID ${currentUser.id} not found.`);
    }
    const card= await this.cardRepository.findOne({where:{id:input.cardId}})
   
    // Validate package bundle
    const packageBundle = await this.entityManager.findOne(PackageBundle, {
      where: { id: input.packageId },
    });
    if (!packageBundle) {
      throw new NotFoundException(`Package bundle with ID ${input.packageId} not found.`);
    }

    const cardInput = {
      cardNumber: card.cardNumber,
      expMonth: card.expMonth.toString(),
      expYear: card.expYear.toString(),
      cvc: card.cvc.toString(),
      coins: packageBundle.coins,
      price: packageBundle.price,
    };

    const subscription = this.subscriptionRepository.create({
      user,
      packageBundle,
      coins:  packageBundle.coins, // Default to package coins
      startDate:  new Date(),
      endDate:  this.calculateEndDate(packageBundle.durationInDays),
    });

    try {
      await this.paymentService.createCard(cardInput) 
      return await this.subscriptionRepository.save(subscription);
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  
  async getAllSubscriptions(): Promise<Subscription[]> {
    try {
      return await this.subscriptionRepository.find({
        relations: ['user', 'packageBundle'], // Include related entities
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

 
  async getSubscriptionById(id: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
      relations: ['user', 'packageBundle'],
    });
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found.`);
    }
    return subscription;
  }

  async updateSubscription(
    id: string,
    updateSubscriptionDto:SubscriptionDtos.UpdateSubscriptionDto,
  ): Promise<Subscription> {
    const subscription = await this.getSubscriptionById(id);

    if (updateSubscriptionDto.coins !== undefined) {
      subscription.coins = updateSubscriptionDto.coins;
    }
    if (updateSubscriptionDto.startDate) {
      subscription.startDate = updateSubscriptionDto.startDate;
    }
    if (updateSubscriptionDto.endDate) {
      subscription.endDate = updateSubscriptionDto.endDate;
    }

    try {
      return await this.subscriptionRepository.save(subscription);
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

 
  async deleteSubscription(id: string): Promise<void> {
    const subscription = await this.getSubscriptionById(id); // Ensure it exists
    try {
      await this.subscriptionRepository.delete(subscription.id);
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  /**
   * Helper method to calculate end date based on duration in days.
   */
  private calculateEndDate(durationInDays: number): Date {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationInDays);
    return endDate;
  }
}
