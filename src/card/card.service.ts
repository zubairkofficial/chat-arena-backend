import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { BaseService } from '../base/base.service';
import { UserRepository } from '../user/user.repository';
import { CommonDTOs } from '../common/dto';
import { Card } from './entities/card.entity';
import { UserService } from '../user/user.service';
import { PaymentService } from '../payment/payment.service';
import { TransactionService } from '../transaction/transaction.service';
import { CardDtos } from '../payment/dto/payment.dto';
import { AllExceptionsFilter } from '../errors/http-exception.filter';
import { CardRepository } from './card.repository';

@Injectable()
export class CardService extends BaseService {
  constructor(
    dataSource: DataSource,
    private readonly entityManager: EntityManager,
    private readonly userRepository: UserRepository,
    private readonly userService: UserService,
    private readonly paymentService: PaymentService,
    private readonly transactionService: TransactionService,
    private readonly cardRepository: CardRepository,
  ) {
    super(dataSource);
  }

  async createCard(currentUser: CommonDTOs.CurrentUser, input: CardDtos.CreateCardInputDto) {
    try {
      const transactionScop = this.getTransactionScope();
      const card = new Card();
      const user = await this.userRepository.findOne({
        where: { id: currentUser.id },
        relations: ['cards'], // Make sure to load related cards
      });
      

     
      const existingCard = user.cards.find(
        (existing) =>
          existing.cardNumber === input.cardNumber &&
          existing.expMonth === Number(input.expMonth) &&
          existing.expYear === Number(input.expYear) &&
          existing.cvc === input.cvc
      );
  
      if (existingCard) {
        throw new Error('A card with the same details already exists.');
      }

      card.cardNumber = input.cardNumber;
      card.expMonth = Number(input.expMonth);
      card.expYear = Number(input.expYear);
      card.cvc = input.cvc;
      card.user = user;

      const cardInput = {
        cardNumber: card.cardNumber,
        expMonth: card.expMonth.toString(),
        expYear: card.expYear.toString(),
        cvc: card.cvc.toString(),
        coins: input.coins,
        price: input.price,
      };

      transactionScop.add(card);
      await this.paymentService.createCard(cardInput);
      const transaction = this.transactionService.createTransaction(user, input, transactionScop);
      transactionScop.add(transaction);
      const updateUser = await this.userService.updateUserCoins(input, user, transactionScop);
      transactionScop.update(updateUser);
      await transactionScop.commit(this.entityManager);
      return transaction;
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  async existingCard( input: CardDtos.ExisitngCardInputDto,id:string,currentUser: CommonDTOs.CurrentUser) {
    try {
      const transactionScop = this.getTransactionScope();
     const user=await this.userService.getUserById(currentUser.id)
    if(!user) throw new NotFoundException("Invalid user specified")
     const card= await this.cardRepository.findOne({where:{id}})
  const cardInput = {
    cardNumber: card.cardNumber,
    expMonth: card.expMonth.toString(),
    expYear: card.expYear.toString(),
    cvc: card.cvc.toString(),
    coins: input.coins,
    price: input.price,
  };

  const transaction = this.transactionService.createTransaction(user, input, transactionScop);
  transactionScop.add(transaction);
  const updateUser = await this.userService.updateUserCoins(input, user, transactionScop);
  transactionScop.update(updateUser);
  await transactionScop.commit(this.entityManager);
  return this.paymentService.createCard(cardInput)  
} catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  getAllCard(currentUser: CommonDTOs.CurrentUser) {
    return this.cardRepository.find({ where: { user: { id: currentUser.id } } });
  }
  findAll() {
    return `This action returns all card`;
  }

  getCardById(id: string) {
return this.cardRepository.findOne({where:{id}})
   
  }

  remove(id: number) {
    return `This action removes a #${id} card`;
  }
}
