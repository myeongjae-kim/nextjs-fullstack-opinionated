import { ApiError } from "@/core/common/domain/ApiError";
import { DomainInternalServerError } from "@/core/common/domain/DomainInternalServerError";
import { DomainNotFoundError } from "@/core/common/domain/DomainNotFoundError";
import { DomainUnauthorizedError } from "@/core/common/domain/DomainUnauthorizedError";
import { ErrorHandler } from "hono";

export const globalErrorHandler: ErrorHandler = ((e) => {
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
      code: "CODE_001",
      message: e.message,
    }), { status: 401 });
  }

  if (e instanceof DomainInternalServerError) {
    return Response.json(new ApiError({
      status: 500,
      error: "INTERNAL_SERVER_ERROR",
      code: "CODE_003",
      message: e.message,
    }), { status: 500 });
  }

  return Response.json(new ApiError({
    status: defaultServerErrorStatus,
    error: "INTERNAL_SERVER_ERROR",
    code: "NONE",
    message: (e as Error).message,
  }), { status: defaultServerErrorStatus });
})