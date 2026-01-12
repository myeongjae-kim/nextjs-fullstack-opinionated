import { parseAuthResponse, refreshAccessToken, verifyAccessToken } from "@/lib/auth/token";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Next.js 16 Proxy를 사용하여 접근 제어 및 자동 토큰 갱신을 처리합니다.
 * /server-actions/* 경로에 대해 인증 상태를 확인하고 리다이렉트합니다.
 */
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // /server-actions/* 경로에만 적용
  if (!pathname.startsWith("/server-actions")) {
    return NextResponse.next();
  }

  // 쿠키에서 세션 읽기
  const sessionCookie = request.cookies.get("@nextjs-fullstack-opinionated/session")?.value;
  const authResponse = parseAuthResponse(sessionCookie);

  // 로그인 상태 확인
  const isAuthenticated = authResponse
    ? verifyAccessToken(authResponse.access_token) !== null
    : false;

  // Access Token이 만료되었지만 Refresh Token이 있는 경우 자동 갱신 시도
  if (authResponse && !isAuthenticated) {
    const refreshed = await refreshAccessToken(authResponse.refresh_token);

    if (refreshed) {
      // 갱신된 토큰을 쿠키에 저장하기 위해 Response 생성
      const response = NextResponse.next();

      // 쿠키 설정 (Next.js의 cookies() API는 middleware에서 사용할 수 없으므로 직접 설정)
      response.cookies.set("@nextjs-fullstack-opinionated/session", JSON.stringify(refreshed), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 180, // 180 days
        path: "/",
      });

      // 갱신 후 다시 인증 상태 확인
      const newIsAuthenticated = verifyAccessToken(refreshed.access_token) !== null;

      // 홈 화면 접근
      if (pathname === "/server-actions") {
        return response;
      }

      // 로그인/회원가입 페이지 접근 시 홈으로 리다이렉트
      if ((pathname === "/server-actions/login" || pathname === "/server-actions/signup") && newIsAuthenticated) {
        return NextResponse.redirect(new URL("/server-actions", request.url));
      }

      return response;
    }
  }

  // 홈 화면 접근 제어
  if (pathname === "/server-actions" || pathname === "/server-actions/") {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/server-actions/login", request.url));
    }
    return NextResponse.next();
  }

  // 로그인/회원가입 페이지 접근 제어
  if (pathname === "/server-actions/login" || pathname === "/server-actions/signup") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/server-actions", request.url));
    }
    return NextResponse.next();
  }

  // 기타 /server-actions/* 경로는 인증 필요
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/server-actions/login", request.url));
  }

  return NextResponse.next();
}
