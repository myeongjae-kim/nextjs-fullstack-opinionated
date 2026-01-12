"use server";

import { DomainNotFoundError } from "@/core/common/domain/DomainNotFoundError";
import { DomainUnauthorizedError } from "@/core/common/domain/DomainUnauthorizedError";
import { applicationContext } from "@/core/config/applicationContext";
import { userLoginSchema } from "@/core/user/domain/User";
import { deleteSessionCookie, setSessionCookie } from "@/lib/auth/cookies";
import { redirect } from "next/navigation";

export type LoginActionResult =
  | { success: true }
  | { success: false; error: string };

/**
 * 로그인 Server Action
 * @param formData 폼 데이터
 * @returns 성공 또는 에러 결과
 */
export async function loginAction(formData: FormData): Promise<LoginActionResult> {
  try {
    // FormData에서 데이터 추출
    const loginIdValue = formData.get("loginId");
    const passwordValue = formData.get("password");
    const loginId = loginIdValue instanceof File ? null : loginIdValue?.toString();
    const password = passwordValue instanceof File ? null : passwordValue?.toString();

    // 유효성 검증
    const validationResult = userLoginSchema.safeParse({
      loginId,
      password,
    });

    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues.map((e) => e.message).join(", "),
      };
    }

    // LoginUseCase 호출
    const loginUseCase = applicationContext().get("LoginUseCase");
    const authResponse = await loginUseCase.login(validationResult.data);

    // 쿠키에 토큰 저장
    await setSessionCookie(authResponse);

    // 성공 시 홈으로 리다이렉트
    // redirect는 클라이언트에서 처리합니다
    return { success: true };
  } catch (error) {
    // 에러 처리
    if (error instanceof DomainUnauthorizedError) {
      return {
        success: false,
        error: "로그인 정보가 올바르지 않습니다.",
      };
    }

    if (error instanceof DomainNotFoundError) {
      return {
        success: false,
        error: "요청한 리소스를 찾을 수 없습니다.",
      };
    }

    // 기타 에러
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message || "로그인 중 오류가 발생했습니다.",
      };
    }

    return {
      success: false,
      error: "알 수 없는 오류가 발생했습니다.",
    };
  }
}

/**
 * 로그아웃 Server Action
 * 쿠키를 삭제하고 로그인 페이지로 리다이렉트합니다.
 */
export async function logoutAction(): Promise<void> {
  await deleteSessionCookie();
  redirect("/server-actions/login");
}
