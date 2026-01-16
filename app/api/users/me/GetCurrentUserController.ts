import { Controller } from '@/app/api/config/Controller.js';
import { userDetailsSchema } from '@/core/auth/domain/UserDetails.js';
import { DomainUnauthorizedError } from '@/core/common/domain/DomainUnauthorizedError.js';
import { createRoute } from '@hono/zod-openapi';

const route = createRoute({
  method: 'get',
  path: '/users/me',
  security: [{
    bearerAuth: [],
  }],
  tags: ['users'],
  responses: {
    200: {
      description: 'The current user details',
      content: {
        'application/json': {
          schema: userDetailsSchema,
        },
      },
    },
  },
})

export default Controller().openapi(route, (c) => {
  const principal = c.get('principal');

  if (!principal) {
    throw new DomainUnauthorizedError();
  }

  return c.json(userDetailsSchema.parse(principal));
})
