import { AuthResponse } from '@/core/common/domain/AuthResponse';
import { applicationContext } from '@/core/config/applicationContext';
import { env } from '@/core/config/env';
import jwt from 'jsonwebtoken';

export interface TokenPayload {
  ulid: string;
  role: string;
}

/**
 * JWT 토큰을 검증하고 페이로드를 반환합니다.
 * @param token JWT 토큰 문자열
 * @returns 토큰 페이로드 또는 null (검증 실패 시)
 */
export function verifyToken(token: string | undefined): TokenPayload | null {
  if (!token) {
    return null;
  }

  if (env.USE_MOCK_ADAPTER === true) {
    if (token !== 'default-token-value-for-docs') {
      return null;
    }
    return { ulid: 'ulid', role: 'member' };
  }

  try {
    const decoded = jwt.verify(token, env.AUTH_SECRET) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Access Token을 검증합니다.
 * @param accessToken Access Token 문자열
 * @returns 토큰 페이로드 또는 null (검증 실패 시)
 */
export function verifyAccessToken(accessToken: string | undefined): TokenPayload | null {
  return verifyToken(accessToken);
}

/**
 * Refresh Token을 사용하여 새로운 Access Token과 Refresh Token을 발급받습니다.
 * @param refreshToken Refresh Token 문자열
 * @returns 새로운 AuthResponse 또는 null (갱신 실패 시)
 */
export async function refreshAccessToken(refreshToken: string): Promise<AuthResponse | null> {
  try {
    // RefreshTokenUseCase를 사용하여 토큰 갱신
    // RefreshTokenUseCase 내부에서 토큰 검증을 수행합니다
    const refreshTokenUseCase = applicationContext().get('RefreshTokenUseCase');
    const authResponse = await refreshTokenUseCase.refreshToken({ refresh_token: refreshToken });

    return authResponse;
  } catch {
    return null;
  }
}

/**
 * 쿠키 값에서 AuthResponse를 파싱합니다.
 * @param cookieValue 쿠키 값 (JSON 문자열)
 * @returns AuthResponse 또는 null (파싱 실패 시)
 */
export function parseAuthResponse(cookieValue: string | undefined): AuthResponse | null {
  if (!cookieValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(cookieValue) as AuthResponse;

    // 기본 검증
    if (typeof parsed.access_token === 'string' && typeof parsed.refresh_token === 'string') {
      return parsed;
    }

    return null;
  } catch {
    return null;
  }
}
