import { env } from '@/core/config/env.js';
import * as schema from '@/lib/db/schema.js';
import { drizzle } from 'drizzle-orm/mysql2';

export const dbLocal = drizzle(env.DB_PRIMARY_URL_LOCAL!, { schema, mode: 'default' });