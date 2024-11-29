import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ArenaAIFigure } from '../../arena-ai-figure/entities/arena-ai-figure.entity';
import { AIFigureType } from '../../common/enums';
import { UserAifigureMessage } from '../../user-aifigure-message/entities/user-aifigure-message.entity';
import { EntityBase } from '../../base/entityBase';

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

  @Column({
    type: 'enum',
    enum: AIFigureType,
  })
  type: AIFigureType; // Use enum type here

  @Column()
  prompt: string;

  @Column({  type: 'boolean', default: false })
  isAiPrivate: boolean;

  @Column({ type: 'text', array: true, nullable: true, default: [] }) // Array of strings (text)
  llmModel: string[];  // This is the array column for arenaModel


  @OneToMany(() => ArenaAIFigure, (arenaAIFigure) => arenaAIFigure.aiFigure)
  arenaAIFigures: ArenaAIFigure[];

  @OneToMany(() => UserAifigureMessage, (userAifigureMessage) => userAifigureMessage.aiFigure)
  userAifigureMessage: UserAifigureMessage[];
}
