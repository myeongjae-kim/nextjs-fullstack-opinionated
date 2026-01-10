import { z } from '@hono/zod-openapi';

export const userDetailsSchema = z.object({
  username: z.string().openapi({ description: "The user username" }),
}).openapi({ description: "The user details schema" });

type UserDetailsType = z.infer<typeof userDetailsSchema>;

export class UserDetails implements UserDetailsType {
  constructor(public readonly username: string) { }
}
