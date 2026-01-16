import { z } from 'zod';

const envSchema = z.object({
  PROFILE: z.enum(['local', 'staging', 'prod']),
  DB_PRIMARY_URL: z.string(),
  DB_REPLICA_URL: z.string(),
  DB_PRIMARY_URL_LOCAL: z.string().optional(),
  USE_MOCK_ADAPTER: z.string().default('false').transform(value => value === 'true'),
  AUTH_SECRET: z.string(),
})

export const env = envSchema.parse(Deno.env.toObject());