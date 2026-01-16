import { z } from '@hono/zod-openapi';

export const articleSchema = z.object({
  id: z.number().openapi({ description: 'The article id' }),
  title: z.string().openapi({ description: 'The article title' }),
  content: z.string().openapi({ description: 'The article content' }),
  createdAt: z.date().openapi({ description: 'The article created at' }),
  updatedAt: z.date().openapi({ description: 'The article updated at' }),
}).openapi({ description: 'The article schema' });

export type Article = z.infer<typeof articleSchema>;

export const articleCreationSchema = articleSchema
  .omit({ id: true, createdAt: true, updatedAt: true });

export type ArticleCreation = z.infer<typeof articleCreationSchema>;

export const articleUpdateSchema = articleCreationSchema
  .partial();

export type ArticleUpdate = z.infer<typeof articleUpdateSchema>;

export const articleListSchema = z.object({ content: articleSchema.array() });