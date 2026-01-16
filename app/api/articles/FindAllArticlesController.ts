import { Controller } from '@/app/api/config/Controller.js';
import { articleListSchema } from '@/core/article/domain/Article.js';
import { applicationContext } from '@/core/config/applicationContext.js';
import { createRoute } from '@hono/zod-openapi';

const route = createRoute({
  method: 'get',
  path: '/articles',
  security: [{
    bearerAuth: [],
  }],
  tags: ['articles'],
  responses: {
    200: {
      description: 'The article list response schema',
      content: {
        'application/json': {
          schema: articleListSchema,
        },
      },
    },
  },
})

export default Controller().openapi(route, async (c) => {
  const articles = await applicationContext().get('FindAllArticlesUseCase').findAll();

  return c.json(articleListSchema.parse({
    content: articles
  }));
})