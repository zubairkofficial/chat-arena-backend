import { TransactionScope } from "./transactionScope";

export abstract class BaseService {
  protected getTransactionScope(): TransactionScope {
    return new TransactionScope();
  }
}
