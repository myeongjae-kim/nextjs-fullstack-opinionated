import { ApiError } from "@/core/common/domain/ApiError";
import globalErrorHandler from "../../globalErrorHandler";
import { returnDefineRoute } from "./returnDefineRoute";

export const defineRoute = returnDefineRoute({
  actionMiddleware: globalErrorHandler,
  handleErrors(errorType, issues) {
    const apiError = ApiError.handleErrors(errorType, issues);
    return Response.json(apiError, { status: apiError.status });
  },
});