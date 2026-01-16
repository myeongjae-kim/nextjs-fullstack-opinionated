import { ApiError } from '@/core/common/domain/ApiError.js';
import { DomainBadRequestError } from '@/core/common/domain/DomainBadRequestError.js';
import { DomainInternalServerError } from '@/core/common/domain/DomainInternalServerError.js';
import { DomainNotFoundError } from '@/core/common/domain/DomainNotFoundError.js';
import { DomainUnauthorizedError } from '@/core/common/domain/DomainUnauthorizedError.js';
import { isDatabaseError } from '@/core/common/util/withDatabaseErrorHandling.js';
import { ErrorHandler } from 'hono';

// 서버 책임의 에러의 경우 console.error로 로깅하고 500 에러 반환
// 클라이언트 책임의 에러의 경우 해당 에러 클래스에 맞는 에러 코드와 메시지를 반환
// 클라이언트가 특정 에러를 구분해야 한다면 ApiError의 code를 사용하면 된다.
export const globalErrorHandler: ErrorHandler = ((e) => {
  if (e instanceof DomainBadRequestError) {
    return Response.json(new ApiError({
      status: 400,
      error: 'DOMAIN_BAD_REQUEST_ERROR',
      code: '',
      message: e.message,
    }), { status: 400 });
  }

  if (e instanceof DomainUnauthorizedError) {
    return Response.json(new ApiError({
      status: 401,
      error: 'DOMAIN_UNAUTHORIZED_ERROR',
      code: '',
      message: e.message,
    }), { status: 401 });
  }

  if (e instanceof DomainNotFoundError) {
    return Response.json(new ApiError({
      status: 404,
      error: 'DOMAIN_NOT_FOUND_ERROR',
      code: '',
      message: e.message,
    }), { status: 404 });
  }

  if (e instanceof DomainInternalServerError) {
    console.error(e);
    return Response.json(new ApiError({
      status: 500,
      error: 'INTERNAL_SERVER_ERROR',
      code: '',
      message: e.message,
    }), { status: 500 });
  }

  if (isDatabaseError(e)) {
    console.error(e);
    return Response.json(new ApiError({
      status: 500,
      error: 'INTERNAL_SERVER_ERROR',
      code: '',
      message: e.cause?.message ?? 'An unexpected database error occurred',
    }), { status: 500 });
  }

  console.error(e);
  return Response.json(new ApiError({
    status: 500,
    error: 'INTERNAL_SERVER_ERROR',
    code: '',
    message: (e as Error).message,
  }), { status: 500 });
})