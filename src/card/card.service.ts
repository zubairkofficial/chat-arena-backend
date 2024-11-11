import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { BaseService } from '../base/base.service';
import { UserRepository } from '../user/user.repository';
import { CommonDTOs } from '../common/dto';
import { Card } from './entities/card.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class CardService extends BaseService {
  constructor(
    dataSource: DataSource,
    private readonly entityManager: EntityManager,
    private readonly userRepository: UserRepository,
    private readonly userService: UserService,
  ) {
    super(dataSource);
  }

  async createCard(currentUser: CommonDTOs.CurrentUser, input: any) {
   const transactionScop=this.getTransactionScope()
   const card=new Card()
    const user = await this.userRepository.findOne({
      where: { id: currentUser.id },
      relations: ['cards'], // Make sure to load related cards
    });

    if (!user) {
      throw new Error('User not found');
    }

    // If user already has a card, return the first card
    if (user.cards && user.cards.length > 0) {
      return user.cards[0]; // Assuming one card per user
    }
    card.cardNumber=input.cardNumber
    card.expMonth=input.expMonth
    card.expYear=input.expYear
    card.cvc=input.cvc
    card.user=input.user
  
   transactionScop.add(card)
   await transactionScop.commit(this.entityManager)
  }

  findAll() {
    return `This action returns all card`;
  }

  findOne(id: number) {
    return `This action returns a #${id} card`;
  }

 

  remove(id: number) {
    return `This action removes a #${id} card`;
  }
}
