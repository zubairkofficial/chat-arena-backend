import { EntityBase } from '../../base/entityBase';
import { User } from '../../user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class Card extends EntityBase {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column()
  cardNumber: string;

  @Column()
  expMonth: number;

  @Column()
  expYear: number;

  @Column()
  cvc: string;

  @ManyToOne(() => User, (user) => user.cards)
  @JoinColumn({ name: 'userId' }) // Define foreign key column to link the Card to User
  user: User;
}
