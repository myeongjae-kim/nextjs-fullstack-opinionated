import z from "zod";

export const articleSchema = z.object({
  id: z.number().describe("Unique identifier of the article"),
  title: z.string().describe("Title of the article"),
  content: z.string().describe("Content of the article"),
});

export type Article = z.infer<typeof articleSchema>;

export const articleCreationSchema = articleSchema
  .omit({ id: true })
  .describe("Object to create an article");

export type ArticleCreation = z.infer<typeof articleCreationSchema>;

export const articleUpdateSchema = articleCreationSchema
  .partial()
  .describe("Object to update an article");

export type ArticleUpdate = z.infer<typeof articleUpdateSchema>;

export const articleListSchema = z.object({ content: articleSchema.array() });