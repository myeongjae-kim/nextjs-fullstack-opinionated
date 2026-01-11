import { env } from '@/core/config/env';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from './schema';

export const db = drizzle(env.DB_URL, { schema, mode: 'default' });

/*
export class TransactionTemplate {
  constructor(private readonly dbClient: typeof db) {
  }

  execute = this.dbClient.transaction.bind(this.dbClient);
}
*/