import { AuthResponse } from "@/core/common/domain/AuthResponse";
import { cookies } from "next/headers";
import { parseAuthResponse } from "./token";

const SESSION_COOKIE_NAME = "session";
// Refresh Token 만료 시간: 6개월 (180일)
const MAX_AGE = 60 * 60 * 24 * 180; // 180 days in seconds

/**
 * 세션 쿠키에 AuthResponse를 저장합니다.
 * @param authResponse 인증 응답 객체
 */
export async function setSessionCookie(authResponse: AuthResponse): Promise<void> {
  const cookieStore = await cookies();
  
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(authResponse), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

/**
 * 세션 쿠키를 삭제합니다.
 */
export async function deleteSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * 세션 쿠키에서 AuthResponse를 읽어옵니다.
 * @returns AuthResponse 또는 null (쿠키가 없거나 파싱 실패 시)
 */
export async function getSessionCookie(): Promise<AuthResponse | null> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  
  return parseAuthResponse(cookieValue);
}
