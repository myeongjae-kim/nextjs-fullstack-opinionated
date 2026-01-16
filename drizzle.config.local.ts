import type { Config } from 'drizzle-kit';

export default {
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'mysql',
  dbCredentials: {
    url: Deno.env.get('DB_PRIMARY_URL_LOCAL')!,
  },
} satisfies Config;
