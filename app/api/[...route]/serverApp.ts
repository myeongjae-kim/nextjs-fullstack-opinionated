import { globalErrorHandler } from '@/app/api/[...route]/config/globalErrorHandler';
import { authMiddleware } from '@/core/auth/application/authMiddleware';
import { env } from '@/core/config/env';
import { OpenAPIHono } from '@hono/zod-openapi';

export const serverApp = new OpenAPIHono().basePath('/api');

// basic settings
serverApp.use('/*', authMiddleware).onError(globalErrorHandler)

// Health check endpoint (no authentication required)
serverApp.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// docs
serverApp.openAPIRegistry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
})

if (env.NEXT_PUBLIC_PROFILE !== 'prod') {
  serverApp.doc('/swagger', (c) => ({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'My API',
    },
    servers: [
      {
        url: new URL(c.req.url).origin,
        description: 'Current environment',
      },
    ],
  }))
  serverApp.get('/docs', (c) => {
    return c.html(`<!doctype html>
<html>

<head>
  <title>API Docs</title>
  <meta charset="utf-8" />
  <meta content="width=device-width, initial-scale=1" name="viewport" />
</head>

<body>
  <div id="app"></div>

  <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>

  <script>
    Scalar.createApiReference('#app', {
      url: "/api/swagger",
      defaultOpenAllTags: true,
      authentication: {
        preferredSecurityScheme: 'bearerAuth',
        securitySchemes: {
          bearerAuth: {
            token: 'default-token-value-for-docs',
          }
        }
      }
    })
  </script>
</body>

</html>`);
  })
}