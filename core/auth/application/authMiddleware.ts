import { UserDetails } from "@/core/auth/domain/UserDetails";
import { DomainUnauthorizedError } from "@/core/common/domain/DomainUnauthorizedError";
import { createMiddleware } from "hono/factory";
import { isApiAuthRequired } from "../config/securityConfig";
import { AuthContext } from "../domain/AuthContext";

const authError = new DomainUnauthorizedError('Invalid or missing authentication token')

const getUserDetails = async (token: string | undefined) => {
  if (!token) {
    return null;
  }

  if (!token.startsWith("Bearer ")) {
    return null;
  }

  const bearerToken = token.split(" ")[1];
  if (bearerToken !== 'default-token-value-for-docs') {
    // token이 올바르지 않으면 public api라도 인증 오류를 발생시킨다.
    throw authError;
  }

  return Promise.resolve(new UserDetails("uuid"));
}

export const authMiddleware = createMiddleware<{ Variables: AuthContext }>(async (c, next) => {
  const isAuthRequired = isApiAuthRequired(c.req.method, c.req.path);

  const token = c.req.header("Authorization");
  const principal = await getUserDetails(token);

  if (!principal && isAuthRequired) {
    throw authError;
  }

  c.set("principal", principal);

  return next();
})