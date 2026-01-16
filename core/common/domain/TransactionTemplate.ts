import { SqlOptions } from '@/core/common/domain/SqlOptions.ts';
import { Autowired } from '@/core/config/Autowired.ts';
import type { DatabaseClient, DbClientSelector } from '@/lib/db/drizzle.ts';
import { MySqlTransactionConfig } from "drizzle-orm/mysql-core";

type TransactionClient = Parameters<DatabaseClient['transaction']>[0] extends (tx: infer Tx) => unknown ? Tx : never

/**
 * Transaction도 비즈니스 로직이다. common domain으로 안에서 관리한다.
 */
export class TransactionTemplate {
  constructor(
    @Autowired('DbClientSelector')
    private readonly dbClientSelector: DbClientSelector) {
  }

  // 읽기, 쓰기를 명시적으로 구분하기 위해 SqlOptions를 첫 번째 인자로 받는다
  public execute = <T>(options: SqlOptions, callback: (tx: TransactionClient) => Promise<T>, config?: Partial<Omit<MySqlTransactionConfig, 'accessMode'>>): Promise<T> => {
    const db = this.dbClientSelector(options);
    const defaultConfig: MySqlTransactionConfig = {
      accessMode: options.useReplica ? 'read only' : 'read write',
      isolationLevel: 'repeatable read'
    }

    return db.transaction((tx) => callback(tx), { ...defaultConfig, ...config });
  }
}