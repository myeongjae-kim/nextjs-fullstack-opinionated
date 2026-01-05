import z from "zod";

const testEnvSchema = z.object({
  TEST_HOST: z.url(),
  TEST_BEARER_TOKEN: z.string(),
})

export const testEnv = testEnvSchema.parse(process.env);