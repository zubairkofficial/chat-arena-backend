import { AIFigure } from '../../aifigure/entities/aifigure.entity';
import { User } from '../../user/entities/user.entity';
import { EntityBase } from '../../base/entityBase';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class UserAifigureMessage extends EntityBase {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ name: 'send_message', type: 'varchar', nullable: false })
  sendMessage: string;

  @Column({ name: 'receive_message', type: 'varchar', nullable: false })
  receiveMessage: string;
  

  @ManyToOne(() => User, (user) => user.userAifigureMessage)
  @JoinColumn({ name: 'user_id' })
  user: User;


  @ManyToOne(() => AIFigure, (aiFigure) => aiFigure.userAifigureMessage)
  @JoinColumn({ name: 'aiFigure_id' })
  aiFigure: AIFigure;


  

  
}
