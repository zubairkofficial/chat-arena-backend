import { ModelType } from '../../common/enums';
import { EntityBase } from '../../base/entityBase';
import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { PackageBundleLlmModel } from '../../package-bundle-llm-model/entities/package-bundle-llm-model.entity';

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
    default: ModelType.GPT_4o, // Default to GPT-3 if no value is provided
  })
  modelType: ModelType;

  @ManyToOne(() => User, user => user.llmModels)
  @JoinColumn({ name: 'user_id' })
  user: User;
  
  @OneToMany(() => PackageBundleLlmModel, (bridge) => bridge.llmModel)
  packageBundleLlmModel: PackageBundleLlmModel[];

}
