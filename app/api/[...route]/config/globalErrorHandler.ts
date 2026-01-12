import { ApiError } from "@/core/common/domain/ApiError";
import { DomainInternalServerError } from "@/core/common/domain/DomainInternalServerError";
import { DomainNotFoundError } from "@/core/common/domain/DomainNotFoundError";
import { DomainUnauthorizedError } from "@/core/common/domain/DomainUnauthorizedError";
import { isDatabaseError } from "@/core/common/util/withDatabaseErrorHandling";
import { ErrorHandler } from "hono";

export const globalErrorHandler: ErrorHandler = ((e) => {
  // global error handler
  const defaultServerErrorStatus = 500;

  if (e instanceof DomainNotFoundError) {
    return Response.json(new ApiError({
      status: 404,
      error: "DOMAIN_NOT_FOUND_ERROR",
      code: "",
      message: e.message,
    }), { status: 404 });
  }

  if (e instanceof DomainUnauthorizedError) {
    return Response.json(new ApiError({
      status: 401,
      error: "DOMAIN_UNAUTHORIZED_ERROR",
      code: "",
      message: e.message,
    }), { status: 401 });
  }

  if (e instanceof DomainInternalServerError) {
    console.error(e);
    return Response.json(new ApiError({
      status: 500,
      error: "INTERNAL_SERVER_ERROR",
      code: "",
      message: e.message,
    }), { status: 500 });
  }

  if (isDatabaseError(e)) {
    console.error(e);
    return Response.json(new ApiError({
      status: 500,
      error: "INTERNAL_SERVER_ERROR",
      code: "",
      message: e.cause?.message ?? "An unexpected database error occurred",
    }), { status: 500 });
  }

  console.error(e);
  return Response.json(new ApiError({
    status: defaultServerErrorStatus,
    error: "INTERNAL_SERVER_ERROR",
    code: "",
    message: (e as Error).message,
  }), { status: defaultServerErrorStatus });
})