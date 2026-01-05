import z from "zod";

export const createListSchema = <Content extends z.ZodTypeAny>(contentSchema: Content) => z.object({
  content: z.array(contentSchema),
})