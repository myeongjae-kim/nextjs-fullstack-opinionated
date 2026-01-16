import { env } from '@/core/config/env.ts';
import * as schema from '@/lib/db/schema.ts';
import { drizzle } from 'drizzle-orm/mysql2';

export const dbLocal = drizzle(env.DB_PRIMARY_URL_LOCAL!, { schema, mode: 'default' });