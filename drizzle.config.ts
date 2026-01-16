import type { Config } from 'drizzle-kit';
import { env } from "./core/config/env.ts";

export default {
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'mysql',
  dbCredentials: {
    url: env.DB_PRIMARY_URL
  },
} satisfies Config;
