import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class Persona {
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id: string;
  

  @Column()
  name: string;

  @Column()
  bio: string;

  @ManyToOne(() => User, (user) => user.personas)
  user: User;
}
