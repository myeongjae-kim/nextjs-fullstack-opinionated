import { Controller } from '@/app/api/config/Controller.js';
import { articleSchema } from '@/core/article/domain/Article.js';
import { DomainNotFoundError } from '@/core/common/domain/DomainNotFoundError.js';
import { applicationContext } from '@/core/config/applicationContext.js';
import { createRoute, z } from '@hono/zod-openapi';

const route = createRoute({
  method: 'get',
  path: '/articles/{id}',
  security: [{
    bearerAuth: [],
  }],
  tags: ['articles'],
  request: {
    params: z.object({
      id: z.string().openapi({
        param: {
          name: 'id',
          in: 'path',
        },
        description: 'The article id',
      }),
    }),
  },
  responses: {
    200: {
      description: 'The article response schema',
      content: {
        'application/json': {
          schema: articleSchema,
        },
      },
    },
  },
})

export default Controller().openapi(route, async (c) => {
  const id = Number(c.req.valid('param').id);

  if (isNaN(id)) {
    throw new DomainNotFoundError(c.req.valid('param').id, 'Article')
  }
  const article = await applicationContext().get('GetArticleByIdUseCase').get(id);

  return c.json(articleSchema.parse(article));
})