import { z } from "zod";
import { clientEnvSchema } from "./clientEnv";

const envSchema = clientEnvSchema.extend({
  DB_PRIMARY_URL: z.string(),
  DB_REPLICA_URL: z.string(),
  DB_PRIMARY_URL_LOCAL: z.string().optional(),
  USE_PERSISTENCE_ADAPTER: z.coerce.boolean().default(false),
  AUTH_SECRET: z.string(),
})

export const env = envSchema.parse(process.env);