import { User } from '../../user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class Achievement {
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id: string;
  

  @Column()
  name: string;

  @Column()
  description: string;

  // Add Many-to-One relationship to associate an achievement with a user
  @ManyToOne(() => User, (user) => user.achievements)
  user: User;  // Each achievement is associated with one user
}
