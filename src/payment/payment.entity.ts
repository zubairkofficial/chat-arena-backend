import { EntityBase } from '../base/entityBase';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Payment extends EntityBase {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    cusId: string;

    @Column()
    cardId: string;

    @Column()
    tokCard: string;
}
