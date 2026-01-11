import { z } from "zod";
import { clientEnvSchema } from "./clientEnv";

const envSchema = clientEnvSchema.extend({
  DB_URL: z.string(),
  DB_URL_LOCAL: z.string().optional(),
})

export const env = envSchema.parse(process.env);