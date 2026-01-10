import { ApiError } from '@/core/common/domain/ApiError';
import { DomainNotFoundError } from '@/core/common/domain/DomainNotFoundError';
import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import z from 'zod';
import ArticleController from './articles/ArticleController';

const app = new Hono().basePath('/api').onError((e) => {
  const defaultServerErrorStatus = 500;

  if (e instanceof DomainNotFoundError) {
    return Response.json(new ApiError({
      status: 404,
      error: "DOMAIN_NOT_FOUND_ERROR",
      code: "CODE_002",
      message: e.message,
    }), { status: 404 });
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