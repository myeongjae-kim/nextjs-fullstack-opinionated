import { ApiError } from '@/core/common/domain/ApiError';
import { DomainNotFoundError } from '@/core/common/domain/DomainNotFoundError';
import { DomainUnauthorizedError } from '@/core/common/domain/DomainUnauthorizedError';
import { Hono } from 'hono';
import z from 'zod';
import { isApiAuthRequired } from './securityConfig';

export const serverApp = new Hono().basePath('/api')
  .use("/*", (c, next) => {
    // Authentication check
    if (!isApiAuthRequired(c.req.method, c.req.path)) {
      return next();
    }

    const token = c.req.header("Authorization");
    const authError = new DomainUnauthorizedError('Invalid or missing authentication token');
    if (!token || !token.startsWith("Bearer ")) {
      throw authError;
    }
    const bearerToken = token.split(" ")[1];

    if (bearerToken !== 'default-token-value-for-docs') {
      throw authError;
    }

    return next();
  })
  .onError((e) => {
    // global error handler
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