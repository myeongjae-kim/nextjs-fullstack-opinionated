import { z } from '@hono/zod-openapi';

export const userDetailsSchema = z.object({
  ulid: z.string().openapi({ description: 'The user ulid' }),
  role: z.string().openapi({ description: 'The user role' }),
}).openapi({ description: 'The user details schema' });

type UserDetailsType = z.infer<typeof userDetailsSchema>;

export class UserDetails implements UserDetailsType {
  constructor(
    public readonly ulid: string,
    public readonly role: string
  ) { }
}
