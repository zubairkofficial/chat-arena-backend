import { CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { CommonDTOs } from '../common/dto';
import { objectState } from '../common/enums';

class EntityBase {
  public id: string | number;
  public objectState: objectState;
  public currentUser: CommonDTOs.CurrentUser; // Should be typed properly
  public transactionScope: any; // Replace with the correct type if available

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date;

  public entitySnapshot?: this;

  constructor(entityBase?: Partial<EntityBase>) {
    if (entityBase) {
      Object.assign(this, entityBase);
    }
  }

  getPropertiesToUpdate() {
    const snapshot = this.entitySnapshot;
    const propertiesToIgnore = [
      'createdAt',
      'updatedAt',
      'deletedAt',
      'entitySnapshot',
      'id',
      'objectState',
    ];
    const updatedProperties = {};

    const keys = Object.keys(this).filter(
      (key) => !propertiesToIgnore.includes(key),
    );

    for (const key of keys) {
      if (this[key]?.isTypeORMEntity) {
        continue;
      }
      if (
        Array.isArray(this[key]) &&
        this[key].length &&
        this[key][0]?.isTypeORMEntity
      ) {
        continue;
      }
      if (
        this[key] instanceof Date &&
        this[key].valueOf() === snapshot[key]?.valueOf()
      ) {
        continue;
      } else {
        updatedProperties[key] = this[key];
      }
    }

    return updatedProperties;
  }
}

export { EntityBase };
