import { z } from "zod";
import { clientEnvSchema } from "./clientEnv";

const envSchema = clientEnvSchema.extend({
  POSTGRES_URL: z.string(),
  POSTGRES_URL_LOCAL: z.string().optional(),
})

export const env = envSchema.parse(process.env);