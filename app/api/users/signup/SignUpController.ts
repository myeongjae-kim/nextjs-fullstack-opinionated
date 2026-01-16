import { Controller } from '@/app/api/config/Controller.ts';
import { authResponseSchema } from '@/core/common/domain/AuthResponse.ts';
import { applicationContext } from '@/core/config/applicationContext.ts';
import { userSignUpSchema } from '@/core/user/domain/User.ts';
import { createRoute } from '@hono/zod-openapi';

const route = createRoute({
  method: 'post',
  path: '/users/signup',
  tags: ['users'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: userSignUpSchema,
        },
      },
      description: 'The user sign up schema',
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
  const authResponse = await applicationContext().get('SignUpUseCase').signUp(c.req.valid('json'));

  return c.json(authResponseSchema.parse(authResponse));
})
