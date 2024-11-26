import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { LlmModel } from '../../llm-model/entities/llm-model.entity';
import { PackageBundle } from '../../package-bundle/entities/package-bundle.entity';
import { EntityBase } from '../../base/entityBase';

@Entity()
export class PackageBundleLlmModel extends EntityBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PackageBundle, (packageBundle) => packageBundle.packageBundleLlmModel)
  @JoinColumn({ name: 'package_bundle_id' })
  packageBundle: PackageBundle;

  @ManyToOne(() => LlmModel, (llmModel) => llmModel.packageBundleLlmModel)
  @JoinColumn({ name: 'llm_model_id' })
  llmModel: LlmModel;
}
