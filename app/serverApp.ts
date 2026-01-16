import CreateArticleController from '@/app/api/articles/CreateArticleController.ts';
import DeleteArticleController from '@/app/api/articles/DeleteArticleController.ts';
import FindAllArticlesController from '@/app/api/articles/FindAllArticlesController.ts';
import GetArticleByIdController from '@/app/api/articles/GetArticleByIdController.ts';
import UpdateArticleController from '@/app/api/articles/UpdateArticleController.ts';
import { globalErrorHandler } from '@/app/api/config/globalErrorHandler.ts';
import LoginController from '@/app/api/users/login/LoginController.ts';
import GetCurrentUserController from '@/app/api/users/me/GetCurrentUserController.ts';
import RefreshTokenController from '@/app/api/users/refresh/RefreshTokenController.ts';
import SignUpController from '@/app/api/users/signup/SignUpController.ts';
import { authMiddleware } from '@/core/auth/application/authMiddleware.ts';
import { env } from '@/core/config/env.ts';
import { $, OpenAPIHono } from '@hono/zod-openapi';

const registerControllers = (app: typeof serverApp) => {
  // Controller가 자신의 full-path를 관리한다. 여기서는 일괄적으로 "/"에 등록한다.
  // 한 개의 메소드만 갖는 계층형 컨트롤러/서비스 패키지 스타일: https://johngrib.github.io/wiki/article/hierarchical-controller-package-structure/
  [
    CreateArticleController,
    DeleteArticleController,
    FindAllArticlesController,
    GetArticleByIdController,
    UpdateArticleController,
    LoginController,
    GetCurrentUserController,
    RefreshTokenController,
    SignUpController,
  ].forEach(controller => app.route('/', controller))
}

const serverApp = $(new OpenAPIHono()
  .get('/', (c) => c.json({ status: 'ok1' }))
  .get('/health', (c) => c.json({ status: 'ok' })))
  .basePath('/api');

// basic settings
// deno-lint-ignore no-explicit-any
serverApp.use('/*', (c, next) => authMiddleware(c as any, next)).onError((e, c) => globalErrorHandler(e, c as any))

// docs
serverApp.openAPIRegistry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
})

if (env.PROFILE !== 'prod') {
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
      servers: [
        {
          url: window.location.origin,
          description: '',
        },
      ],
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

registerControllers(serverApp);

export default serverApp;