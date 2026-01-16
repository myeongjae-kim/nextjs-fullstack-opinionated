import { z } from '@hono/zod-openapi';

export const authResponseSchema = z.object({
  access_token: z.string().openapi({ description: 'The access token (JWT)' }),
  refresh_token: z.string().openapi({ description: 'The refresh token (JWT)' }),
}).openapi({ description: 'The authentication response schema' });

export type AuthResponse = z.infer<typeof authResponseSchema>;
