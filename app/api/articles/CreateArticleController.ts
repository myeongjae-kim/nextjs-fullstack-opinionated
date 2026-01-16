import { Controller } from '@/app/api/config/Controller.js';
import { articleCreationSchema } from '@/core/article/domain/Article.js';
import { creationResponseSchema } from '@/core/common/domain/CreationResponse.js';
import { applicationContext } from '@/core/config/applicationContext.js';
import { createRoute } from '@hono/zod-openapi';

const route = createRoute({
  method: 'post',
  path: '/articles',
  security: [{
    bearerAuth: [],
  }],
  tags: ['articles'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: articleCreationSchema,
        },
      },
      description: 'The article creation schema',
      required: true,
    }
  },
  responses: {
    200: {
      description: 'The article creation response schema',
    },
  },
})

export default Controller().openapi(route, async (c) => {
  const article = await applicationContext().get('CreateArticleUseCase').create(c.req.valid('json'));

  // authMiddleware에서 설정한 principal을 아래처럼 접근할 수 있다.
  const _principal = c.get('principal');

  return Response.json(creationResponseSchema.parse(article));
});