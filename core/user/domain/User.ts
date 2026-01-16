import { z } from '@hono/zod-openapi';

export const userSchema = z.object({
  id: z.number().openapi({ description: 'The user id' }),
  ulid: z.string().openapi({ description: 'The user ulid' }),
  name: z.string().nullable().openapi({ description: 'The user name' }),
  loginId: z.string().openapi({ description: 'The user login id' }),
  role: z.string().openapi({ description: 'The user role' }),
  createdAt: z.date().openapi({ description: 'The user created at' }),
  updatedAt: z.date().openapi({ description: 'The user updated at' }),
}).openapi({ description: 'The user schema' });

export type User = z.infer<typeof userSchema>;

export const userSignUpSchema = z.object({
  loginId: z.string().openapi({ description: 'The user login id' }),
  password: z.string().openapi({ description: 'The user password' }),
  name: z.string().optional().openapi({ description: 'The user name' }),
}).openapi({ description: 'The user sign up schema' });

export type UserSignUp = z.infer<typeof userSignUpSchema>;

export const userLoginSchema = z.object({
  loginId: z.string().openapi({ description: 'The user login id' }),
  password: z.string().openapi({ description: 'The user password' }),
}).openapi({ description: 'The user login schema' });

export type UserLogin = z.infer<typeof userLoginSchema>;

export const refreshTokenSchema = z.object({
  refresh_token: z.string().openapi({ description: 'The refresh token' }),
}).openapi({ description: 'The refresh token schema' });

export type RefreshToken = z.infer<typeof refreshTokenSchema>;
