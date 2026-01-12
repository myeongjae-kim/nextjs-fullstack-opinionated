"use server";

import { applicationContext } from "@/core/config/applicationContext";
import { userSignUpSchema } from "@/core/user/domain/User";
import { setSessionCookie } from "@/lib/auth/cookies";
import { DomainUnauthorizedError } from "@/core/common/domain/DomainUnauthorizedError";
import { DomainNotFoundError } from "@/core/common/domain/DomainNotFoundError";

export type SignUpActionResult = 
  | { success: true }
  | { success: false; error: string };

/**
 * 회원가입 Server Action
 * @param formData 폼 데이터
 * @returns 성공 또는 에러 결과
 */
export async function signUpAction(formData: FormData): Promise<SignUpActionResult> {
  try {
    // FormData에서 데이터 추출
    const loginIdValue = formData.get("loginId");
    const passwordValue = formData.get("password");
    const nameValue = formData.get("name");
    const loginId = loginIdValue instanceof File ? null : loginIdValue?.toString();
    const password = passwordValue instanceof File ? null : passwordValue?.toString();
    const name = nameValue instanceof File ? null : nameValue?.toString();

    // 유효성 검증
    const validationResult = userSignUpSchema.safeParse({
      loginId,
      password,
      name: name || undefined,
    });

    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues.map((e) => e.message).join(", "),
      };
    }

    // SignUpUseCase 호출
    const signUpUseCase = applicationContext().get("SignUpUseCase");
    const authResponse = await signUpUseCase.signUp(validationResult.data);

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
        error: "인증에 실패했습니다. 로그인 정보를 확인해주세요.",
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
        error: error.message || "회원가입 중 오류가 발생했습니다.",
      };
    }

    return {
      success: false,
      error: "알 수 없는 오류가 발생했습니다.",
    };
  }
}
