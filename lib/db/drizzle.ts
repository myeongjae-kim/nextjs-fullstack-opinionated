import { SqlOptions } from '@/core/common/domain/SqlOptions';
import { env } from '@/core/config/env';
import * as schema from '@/lib/db/schema';
import { drizzle } from 'drizzle-orm/mysql2';

export const dbPrimary = drizzle(env.DB_PRIMARY_URL, { schema, mode: 'default' });
export const dbReplica = drizzle(env.DB_REPLICA_URL, { schema, mode: 'default' });

// dbPrimary와 dbReplica가 타입 호환이 안 되면 컴파일에러 생기도록 보장
const _ = ({} as typeof dbReplica) satisfies typeof dbPrimary

export type DatabaseClient = typeof dbPrimary;

export const selectDbClient = (args?: SqlOptions): DatabaseClient => args?.useReplica ? dbReplica : dbPrimary;
export type DbClientSelector = typeof selectDbClient;
