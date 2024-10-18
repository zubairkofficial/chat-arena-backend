import { ArenaType } from 'src/arena-type/entities/arena-type.entity';
import { AIFigure } from 'src/aifigure/entities/aifigure.entity';
import { Conversation } from 'src/conversation/entities/conversation.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne,  OneToMany } from 'typeorm';
import { UserArena } from 'src/user-arena/entities/user-arena.entity';
import { EntityBase } from 'src/base/entityBase';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class Arena extends EntityBase {
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id: string;

  @Column()
  name: string;  // Arena name

  @Column({ type: 'text', nullable: true })
  description: string;  // Description of the arena

  @Column({ type: 'timestamp', nullable: true })
  expiryTime: Date;  // Optional expiry time for the arena

  @Column({ type: 'int', default: 0 })
  maxParticipants: number;  

  @Column({ type: 'enum', enum: ['open', 'inprogress', 'full'], default: 'open' })
  status: string;  


  @ManyToOne(() => User, (user) => user.arenas) // Create a relationship with the User entity
  createdBy: User;
  
  @OneToMany(() => UserArena, (userArena) => userArena.arena)
  userArenas: UserArena[]; 

   // List of AI figures in the arena

  @ManyToOne(() => AIFigure, (aiFigures) => aiFigures.arenas)
  aiFigures: AIFigure;


  @OneToMany(() => Conversation, (conversation) => conversation.arena)
  conversations: Conversation[];  // Arena conversation history

  @ManyToOne(() => ArenaType, (arenaType) => arenaType.arenas)
  arenaType: ArenaType;  // The type of the arena

 
}