import { z } from 'zod';

export const clientEnvSchema = z.object({
  NEXT_PUBLIC_PROFILE: z.enum(['local', 'staging', 'prod']),
})

export const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_PROFILE: process.env.NEXT_PUBLIC_PROFILE,
});