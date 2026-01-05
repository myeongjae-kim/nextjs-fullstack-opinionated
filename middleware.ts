import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { isApiAuthRequired } from './app/api/securityConfig';
import { ApiError } from './core/common/domain/ApiError';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { method } = request;

  if (isApiAuthRequired(method, pathname)) {
    const authHeader = request.headers.get('Authorization');

    // here is the place of complex auth logic
    const expectedToken = 'Bearer default-token-value-for-docs';

    if (authHeader !== expectedToken) {
      return NextResponse.json(
        new ApiError({
          status: 401,
          error: 'UNAUTHORIZED',
          code: 'AUTH_001',
          message: 'Invalid or missing authentication token',
        }),
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}
