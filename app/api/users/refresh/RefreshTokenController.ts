import { Controller } from '@/app/api/config/Controller.ts';
import { authResponseSchema } from '@/core/common/domain/AuthResponse.ts';
import { applicationContext } from '@/core/config/applicationContext.ts';
import { refreshTokenSchema } from '@/core/user/domain/User.ts';
import { createRoute } from '@hono/zod-openapi';

const route = createRoute({
  method: 'post',
  path: '/users/refresh',
  tags: ['users'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: refreshTokenSchema,
        },
      },
      description: 'The refresh token schema',
      required: true,
    }
  },
  responses: {
    200: {
      description: 'The authentication response schema',
      content: {
        'application/json': {
          schema: authResponseSchema,
        },
      },
    },
  },
})

export default Controller().openapi(route, async (c) => {
  const authResponse = await applicationContext().get('RefreshTokenUseCase').refreshToken(c.req.valid('json'));

  return c.json(authResponseSchema.parse(authResponse));
})
