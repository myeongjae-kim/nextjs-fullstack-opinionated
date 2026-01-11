import type { Config } from 'drizzle-kit';

export default {
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'mysql',
  dbCredentials: {
    url: process.env.DB_PRIMARY_URL!,
  },
} satisfies Config;
