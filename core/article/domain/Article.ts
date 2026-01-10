import z from "zod";

export const articleSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
});

export type Article = z.infer<typeof articleSchema>;

export const articleCreationSchema = articleSchema
  .omit({ id: true });

export type ArticleCreation = z.infer<typeof articleCreationSchema>;

export const articleUpdateSchema = articleCreationSchema
  .partial();

export type ArticleUpdate = z.infer<typeof articleUpdateSchema>;

export const articleListSchema = z.object({ content: articleSchema.array() });