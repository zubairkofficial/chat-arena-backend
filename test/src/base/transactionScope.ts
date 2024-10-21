/* eslint-disable @typescript-eslint/ban-types */
import { DataSource, EntityManager, getManager } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { RemoveOptions } from 'typeorm/repository/RemoveOptions';
import { SaveOptions } from 'typeorm/repository/SaveOptions';
import { OrmUtils } from 'typeorm/util/OrmUtils';

import { EntityBase } from './entityBase';
import { objectState } from '../common/enums';
import { logger } from '../logger';

export interface IRawQuery {
  query: string;
  parameters: any[];
}

export enum HookType {
  AFTER_COMMIT = 'AFTER_COMMIT',
}

export interface RegisterHooksProps {
  listener: Function;
  data: {
    [key: string]: any;
  };
}

interface HooksMetaData extends RegisterHooksProps {
  type: HookType;
}

export enum TransactionCollectionEnum {
  RAW_QUERY,
  ENTITY_COLLECTION,
  BULK_ENTITY_COLLECTION,
}

export class TransactionScopeOptions {
  where?: any;
  values: QueryDeepPartialEntity<EntityBase>;
}

export class TransactionScopeObject {
  type: TransactionCollectionEnum;
  object: EntityBase[] | EntityBase | IRawQuery;
  objectState?: objectState;
  options?: TransactionScopeOptions;
}

export class TransactionScope {
  private _transaction_objects: TransactionScopeObject[] = [];
  private _hooks: HooksMetaData[] = [];
  private dataSource: DataSource; // Add a field for DataSource

  get transaction_objects(): TransactionScopeObject[] {
    return this._transaction_objects;
  }

  constructor(dataSource: DataSource) {
    // Accept DataSource in constructor
    this.dataSource = dataSource; // Assign it to the field
  }

  public addRawQuery(query: string, parameters: any[]) {
    this._transaction_objects.push({
      type: TransactionCollectionEnum.RAW_QUERY,
      object: { query: query, parameters: parameters },
    });
  }

  private resetTransactionObjects(): void {
    this._transaction_objects = [];
  }

  public add(obj: EntityBase): void {
    this._transaction_objects.push({
      type: TransactionCollectionEnum.ENTITY_COLLECTION,
      object: obj,
      objectState: objectState.INSERT,
    });
  }

  public addCollection(collection: EntityBase[]): void {
    this._transaction_objects.push({
      type: TransactionCollectionEnum.BULK_ENTITY_COLLECTION,
      object: collection,
      objectState: objectState.INSERT,
    });
  }

  public update(obj: EntityBase): void {
    this._transaction_objects.push({
      type: TransactionCollectionEnum.ENTITY_COLLECTION,
      object: obj,
      objectState: objectState.UPDATE,
    });
  }

  private registerHook(props: HooksMetaData): void {
    this._hooks.push(props);
  }

  private filterHooks(type: HookType) {
    return this._hooks.filter((hook) => hook.type === type);
  }

  private excludeHooks(type: HookType) {
    return this._hooks.filter((hook) => hook.type !== type);
  }

  /**
   * Register the listener function as AfterCommit Hooks. It will be invoked after the changes are committed to db.
   * Invoked function will received data object as argument. It is recommended to use arrow functions.
   *
   * @param listener Function to be called after changes are committed to db.
   * @param data data object that will passed as argument when Hook is invoked.
   * @return
   * @example
   *
   * transactionScope.registerAfterCommit({
   *   listener: (data) => {
   *     console.log(data.name);
   *   },
   *   data: {
   *     name: "Roronoa Zoro",
   *   },
   * });
   */
  public registerAfterCommit(props: RegisterHooksProps) {
    this.registerHook({
      ...props,
      type: HookType.AFTER_COMMIT,
    });
  }

  /**
   * Clear all register AfterCommits Hooks.
   */
  public resetAfterCommit() {
    this._hooks = this.excludeHooks(HookType.AFTER_COMMIT);
  }

  public bulkInsert<T extends EntityBase>(objs: T[]): void {
    if (!objs.length) return;
    this._transaction_objects.push({
      type: TransactionCollectionEnum.BULK_ENTITY_COLLECTION,
      object: objs,
      objectState: objectState.BULK_INSERT,
    });
  }

  public updateCollection(collection: EntityBase[]): void {
    for (const col of collection) {
      if (col.entitySnapshot) {
        collection.forEach((obj) => this.update(obj));
        return;
      }
    }
    this._transaction_objects.push({
      type: TransactionCollectionEnum.BULK_ENTITY_COLLECTION,
      object: collection,
      objectState: objectState.UPDATE,
    });
  }

  public delete(obj: EntityBase): void {
    this._transaction_objects.push({
      type: TransactionCollectionEnum.ENTITY_COLLECTION,
      object: obj,
      objectState: objectState.DELETE,
    });
  }

  public hardDelete(obj: EntityBase): void {
    this._transaction_objects.push({
      type: TransactionCollectionEnum.ENTITY_COLLECTION,
      object: obj,
      objectState: objectState.HARD_DELETE,
    });
  }

  public deleteCollection(collection: EntityBase[]): void {
    this._transaction_objects.push({
      type: TransactionCollectionEnum.BULK_ENTITY_COLLECTION,
      object: collection,
      objectState: objectState.DELETE,
    });
  }

  public hardDeleteCollection(collection: EntityBase[]): void {
    this._transaction_objects.push({
      type: TransactionCollectionEnum.BULK_ENTITY_COLLECTION,
      object: collection,
      objectState: objectState.HARD_DELETE,
    });
  }

  private async processAfterCommitHooks() {
    try {
      const afterCommitsHooks = this.filterHooks(HookType.AFTER_COMMIT);
      const promises = afterCommitsHooks.map((hook) =>
        hook.listener(hook.data),
      );
      await Promise.allSettled(promises);
    } catch (error) {
      logger(
        'error while executing transaction scope AfterCommit Hooks' + error,
        'error',
      );
      throw error;
    } finally {
      this.resetAfterCommit();
    }
  }

  private extractCollectionsFromTransactions(
    transaction_objects: TransactionScopeObject[],
  ) {
    const entity_collection = [];
    const raw_query_collection = [];

    transaction_objects.forEach((tr_obj) => {
      if (tr_obj.type === TransactionCollectionEnum.ENTITY_COLLECTION) {
        entity_collection.push(tr_obj);
      } else if (
        tr_obj.type === TransactionCollectionEnum.BULK_ENTITY_COLLECTION
      ) {
        const obj = tr_obj.object as EntityBase[];
        entity_collection.push(...obj);
      } else {
        raw_query_collection.push(tr_obj);
      }
    });

    return [entity_collection, raw_query_collection];
  }

  public async commit(
    entityManager: EntityManager,
    saveOptions?: SaveOptions,
    removeOptions?: RemoveOptions,
    performEntityBulkUpsert = false,
  ): Promise<void> {
    try {
      await entityManager.transaction(async (transactionEntityManager) => {
        if (performEntityBulkUpsert) {
          const [entity_collection, raw_query_collection] =
            this.extractCollectionsFromTransactions(this.transaction_objects);

          await transactionEntityManager.save(entity_collection, saveOptions);
          if (raw_query_collection.length > 0) {
            for (const rawquery of raw_query_collection) {
              await transactionEntityManager.query(
                rawquery.query,
                rawquery.parameters,
              );
            }
          }
        } else {
          for (const transaction of this.transaction_objects) {
            if (transaction.type === TransactionCollectionEnum.RAW_QUERY) {
              const rawquery = transaction.object as IRawQuery;
              await transactionEntityManager.query(
                rawquery.query,
                rawquery.parameters,
              );
            } else if (
              transaction.type ===
                TransactionCollectionEnum.ENTITY_COLLECTION ||
              transaction.type ===
                TransactionCollectionEnum.BULK_ENTITY_COLLECTION
            ) {
              let entity: any[] | EntityBase | IRawQuery;
              switch (transaction.objectState) {
                case objectState.DELETE:
                  entity = transaction.object as EntityBase | EntityBase[];
                  await transactionEntityManager.softRemove(
                    entity,
                    saveOptions,
                  );
                  break;
                case objectState.HARD_DELETE:
                  entity = transaction.object as EntityBase | EntityBase[];
                  await transactionEntityManager.remove(entity, saveOptions);
                  break;
                case objectState.UPDATE:
                  entity = transaction.object;
                  if (entity instanceof EntityBase) {
                    if (entity.entitySnapshot) {
                      const entityClass =
                        entity['__proto__']['constructor']['name'];
                      const propertiesToUpdate = entity.getPropertiesToUpdate();
                      await transactionEntityManager.update(
                        entityClass,
                        { id: entity.id },
                        propertiesToUpdate,
                      );
                    } else if (transaction.options) {
                      const criteria = transaction.options.where
                        ? transaction.options.where
                        : { id: entity.id };
                      const entityClass =
                        entity['__proto__']['constructor']['name'];
                      await transactionEntityManager.update(
                        entityClass,
                        criteria,
                        transaction.options.values,
                      );
                    } else {
                      await transactionEntityManager.save(entity, saveOptions);
                    }
                  } else if (Array.isArray(entity)) {
                    for (const en of entity) {
                      if (en instanceof EntityBase) {
                        const entityClass =
                          en['__proto__']['constructor']['name'];
                        const propertiesToUpdate = en.getPropertiesToUpdate();
                        await transactionEntityManager.update(
                          entityClass,
                          { id: en.id },
                          propertiesToUpdate,
                        );
                      } else {
                        await transactionEntityManager.save(
                          entity,
                          saveOptions,
                        );
                      }
                    }
                  } else {
                    logger(
                      'ENTITY NOT AN INSTANCE OF ENTITY BASE' + entity,
                      'error',
                    );
                    throw new Error('Entity is not an instance of entity base');
                  }
                  break;
                case objectState.INSERT:
                  if (transaction.options) {
                    entity = transaction.object;
                    const entityClass =
                      entity['__proto__']['constructor']['name'];
                    const insertResult = (
                      await transactionEntityManager.insert(
                        entityClass,
                        transaction.options.values,
                      )
                    ).generatedMaps[0];
                    // deep merge insert result in transaction.object
                    OrmUtils.mergeDeep(transaction.object, insertResult);
                  } else {
                    entity = transaction.object as EntityBase | EntityBase[];
                    await transactionEntityManager.save(entity, saveOptions);
                  }
                  break;
                case objectState.BULK_INSERT:
                  entity = transaction.object[0] as EntityBase;
                  const entityClass =
                    entity['__proto__']['constructor']['name'];
                  await transactionEntityManager.insert(
                    entityClass,
                    transaction.object as EntityBase[],
                  );
                  break;
              }
            }
          }
        }
      });
      this.resetTransactionObjects();
    } catch (error) {
      this.resetTransactionObjects();
      throw error;
    }
    // process AfterCommits Hooks
    await this.processAfterCommitHooks();
  }
}
