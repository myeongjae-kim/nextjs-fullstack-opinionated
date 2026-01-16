import CreateArticleController from '@/app/api/articles/CreateArticleController.js';
import DeleteArticleController from '@/app/api/articles/DeleteArticleController.js';
import FindAllArticlesController from '@/app/api/articles/FindAllArticlesController.js';
import GetArticleByIdController from '@/app/api/articles/GetArticleByIdController.js';
import UpdateArticleController from '@/app/api/articles/UpdateArticleController.js';
import { globalErrorHandler } from '@/app/api/config/globalErrorHandler.js';
import LoginController from '@/app/api/users/login/LoginController.js';
import GetCurrentUserController from '@/app/api/users/me/GetCurrentUserController.js';
import RefreshTokenController from '@/app/api/users/refresh/RefreshTokenController.js';
import SignUpController from '@/app/api/users/signup/SignUpController.js';
import { authMiddleware } from '@/core/auth/application/authMiddleware.js';
import { env } from '@/core/config/env.js';
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
    SignUpController,
    LoginController,
    RefreshTokenController,
    GetCurrentUserController,
  ].forEach(controller => app.route('/', controller))
}

const serverApp = $(new OpenAPIHono()
  .get('/', (c) => c.json({ status: 'ok' }))
  .get('/health', (c) => c.json({ status: 'ok' })))
  .basePath('/api');

// basic settings
serverApp.use('/*', authMiddleware).onError(globalErrorHandler)

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