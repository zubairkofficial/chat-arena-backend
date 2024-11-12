import { User } from '../../user/entities/user.entity';
import { EntityBase } from '../../base/entityBase';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class Transaction extends EntityBase {
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    id: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 }) // For price in dollars (e.g., 0.5, 1.00)
    price: number;

    @Column()
    coins: number;  // Coins purchased (100, 200, 1000, etc.)

    @ManyToOne(() => User, user => user.transactions)  // Create relation with User
    @JoinColumn({ name: 'user_id' })  // Foreign key column in Transaction table
    user: User;  // Relation to the User entity
}
