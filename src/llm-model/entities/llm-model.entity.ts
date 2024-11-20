import { ModelType } from '../../common/enums';
import { EntityBase } from '../../base/entityBase';
import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class LlmModel extends EntityBase{
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 512 })
  apiKey: string;

  
  @Column({
    type: 'enum',
    enum: ModelType,
    default: ModelType.GPT_3, // Default to GPT-3 if no value is provided
  })
  modelType: ModelType;

  @ManyToOne(() => User, user => user.llmModels)
  @JoinColumn({ name: 'user_id' })
  user: User;
  
}
