import { Autowired } from "@/core/config/Autowired";
import type { DbClientSelector } from "@/lib/db/drizzle";
import { SqlOptions } from "./SqlOptions";

/**
 * Transaction도 비즈니스 로직이다. common domain으로 관리한다.
 */
export class TransactionTemplate {
  constructor(
    @Autowired("DbClientSelector")
    private readonly dbClientSelector: DbClientSelector) {
  }

  public execute = <T>(callback: () => Promise<T>, options: SqlOptions): Promise<T> => {
    return this.dbClientSelector(options).transaction(callback);
  }
}