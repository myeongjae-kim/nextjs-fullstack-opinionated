import { DomainInternalServerError } from "@/core/common/domain/DomainInternalServerError";
import { DrizzleQueryError } from "drizzle-orm";

/**
 * 데이터베이스 에러인지 확인하는 헬퍼 함수
 * DrizzleQueryError 인스턴스인지 확인합니다.
 */
function isDatabaseError(error: unknown): error is DrizzleQueryError {
  return error instanceof DrizzleQueryError;
}

/**
 * 객체의 모든 메서드를 자동으로 래핑하여 데이터베이스 에러를 처리하는 고계함수
 * DrizzleQueryError가 발생하면 로그를 남기고 DomainInternalServerError를 throw합니다.
 * (DrizzleQueryError를 그대로 throw하면 message에 쿼리가 들어있기 때문에 쿼리를 숨기기 위함입니다)
 * 
 * @param target 래핑할 객체
 * @returns Proxy로 래핑된 객체 (원본과 동일한 타입)
 */
export function withDatabaseErrorHandling<T extends object>(target: T): T {
  return new Proxy(target, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);

      // 함수인 경우에만 래핑
      if (typeof value === "function") {
        return async (...args: unknown[]) => {
          try {

            return await (value as (...args: unknown[]) => Promise<unknown>).apply(target, args);
          } catch (error) {
            if (isDatabaseError(error)) {
              console.error("Database error:", error);
              throw new DomainInternalServerError(error.cause?.message);
            }
            throw error;
          }
        };
      }

      return value;
    },
  });
}
