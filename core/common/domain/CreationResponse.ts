import z from 'zod';

export const creationResponseSchema = z.object({
  id: z.number(),
});
