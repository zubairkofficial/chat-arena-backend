import { EntityBase } from '../base/entityBase';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('error_logs')
export class ErrorLog extends EntityBase{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  message: string;

  @Column()
  path: string;

  @Column()
  status: number;

  @Column({ type: 'text' })
  stack: string;
  
}
