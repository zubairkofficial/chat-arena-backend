import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
import { ArenaAIFigure } from '../../arena-ai-figure/entities/arena-ai-figure.entity';
import { UserAifigureMessage } from '../../user-aifigure-message/entities/user-aifigure-message.entity';
import { EntityBase } from '../../base/entityBase';
import { User } from '../../user/entities/user.entity';
import { AifigureType } from '../../aifigure-type/entities/aifigure-type.entity';

@Entity()
export class AIFigure extends EntityBase {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true }) // Make image optional
  image?: string;

  @Column()
  description: string;

  
  // @Column({
  //   type: 'enum',
  //   enum: AIFigureType,
  // })
  // type: AIFigureType; // Use enum type here

  @Column()
  prompt: string;

  @Column({  type: 'boolean', default: false })
  isAiPrivate: boolean;

  @Column({ type: 'text', array: true, nullable: true, default: [] }) // Array of strings (text)
  llmModel: string[];  // This is the array column for arenaModel

    @ManyToOne(() => User, (user) => user.aiFigures)
  @JoinColumn({ name: 'createdBy' })
  createdBy: User;

  @OneToMany(() => ArenaAIFigure, (arenaAIFigure) => arenaAIFigure.aiFigure)
  arenaAIFigures: ArenaAIFigure[];

  @OneToMany(() => UserAifigureMessage, (userAifigureMessage) => userAifigureMessage.aiFigure)
  userAifigureMessage: UserAifigureMessage[];
  
  @ManyToOne(() => AifigureType, (type) => type.aiFigures, { eager: true })
  @JoinColumn({ name: 'aifigureTypeId' })
  aifigureType: AifigureType;

}
