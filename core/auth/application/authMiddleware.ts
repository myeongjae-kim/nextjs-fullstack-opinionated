import { isApiAuthRequired } from '@/core/auth/config/securityConfig';
import { AuthContext } from '@/core/auth/domain/AuthContext';
import { UserDetails } from '@/core/auth/domain/UserDetails';
import { DomainUnauthorizedError } from '@/core/common/domain/DomainUnauthorizedError';
import { env } from '@/core/config/env';
import { createMiddleware } from 'hono/factory';
import jwt from 'jsonwebtoken';

const authError = new DomainUnauthorizedError('Invalid or missing authentication token')

const getUserDetails = (token: string | undefined) => {
  if (!token) {
    return null;
  }

  if (!token.startsWith('Bearer ')) {
    return null;
  }

  const bearerToken = token.split(' ')[1];

  if (env.USE_MOCK_ADAPTER === true) {
    if (bearerToken !== 'default-token-value-for-docs') {
      // token이 올바르지 않으면 public api라도 인증 오류를 발생시킨다.
      throw authError;
    }

    return new UserDetails('ulid', 'member');
  }

  try {
    const decoded = jwt.verify(bearerToken ?? '', env.AUTH_SECRET) as unknown as { ulid: string; role: string };
    return new UserDetails(decoded.ulid, decoded.role);
  } catch {
    // token이 올바르지 않으면 public api라도 인증 오류를 발생시킨다.
    throw authError;
  }
}

export const authMiddleware = createMiddleware<{ Variables: AuthContext }>(async (c, next) => {
  const isAuthRequired = isApiAuthRequired(c.req.method, c.req.path);

  const token = c.req.header('Authorization');
  const principal = getUserDetails(token);

  if (!principal && isAuthRequired) {
    throw authError;
  }

  c.set('principal', principal);

  return next();
})