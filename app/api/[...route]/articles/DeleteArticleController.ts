import { Controller } from '@/app/api/[...route]/config/Controller';
import { DomainNotFoundError } from '@/core/common/domain/DomainNotFoundError';
import { applicationContext } from '@/core/config/applicationContext';
import { createRoute, z } from '@hono/zod-openapi';

const route = createRoute({
  method: 'delete',
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
    204: {
      description: 'Article deleted successfully',
    },
  },
})

export default Controller().openapi(route, async (c) => {
  const id = Number(c.req.valid('param').id);

  if (isNaN(id)) {
    throw new DomainNotFoundError(c.req.valid('param').id, 'Article')
  }

  // authMiddleware에서 설정한 principal을 아래처럼 접근할 수 있다.
  const _principal = c.get('principal');

  await applicationContext().get('DeleteArticleUseCase').delete(id);

  return new Response(null, { status: 204 });
})