import { ApiError } from '@/core/common/domain/ApiError';
import { DomainNotFoundError } from '@/core/common/domain/DomainNotFoundError';
import { DomainUnauthorizedError } from '@/core/common/domain/DomainUnauthorizedError';
import { Hono } from 'hono';
import { bearerAuth } from 'hono/bearer-auth';
import { handle } from 'hono/vercel';
import z from 'zod';
import ArticleController from './articles/ArticleController';
import { isApiAuthRequired } from './securityConfig';

const app = new Hono().basePath('/api')
  .use("/*", bearerAuth({
    verifyToken: (token, c) => {
      if (!isApiAuthRequired(c.req.method, c.req.path)) {
        return true;
      }

      if (token === 'default-token-value-for-docs') {
        return true;
      }

      throw new DomainUnauthorizedError('Invalid or missing authentication token');
    }
  }))
  .onError((e) => {
    const defaultServerErrorStatus = 500;

    if (e instanceof DomainNotFoundError) {
      return Response.json(new ApiError({
        status: 404,
        error: "DOMAIN_NOT_FOUND_ERROR",
        code: "CODE_002",
        message: e.message,
      }), { status: 404 });
    }

    if (e instanceof DomainUnauthorizedError) {
      return Response.json(new ApiError({
        status: 401,
        error: "DOMAIN_UNAUTHORIZED_ERROR",
        code: "CODE_002",
        message: e.message,
      }), { status: 401 });
    }

    if (e instanceof z.ZodError) {
      return Response.json(new ApiError({
        status: defaultServerErrorStatus,
        error: "VALIDATION_ERROR_IN_ACTION",
        code: "CODE_001",
        message: e.issues?.[0]?.message,
      }), { status: defaultServerErrorStatus });
    }

    return Response.json(new ApiError({
      status: defaultServerErrorStatus,
      error: "INTERNAL_SERVER_ERROR",
      code: "NONE",
      message: (e as Error).message,
    }), { status: defaultServerErrorStatus });
  });

app.route("/", ArticleController)

export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const PATCH = handle(app)
export const DELETE = handle(app)