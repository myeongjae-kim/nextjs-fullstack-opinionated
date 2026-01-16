# 코딩 컨벤션

이 문서는 프로젝트의 코딩 컨벤션과 아키텍처 패턴을 정리한 것입니다.

## 아키텍처

### Hexagonal Architecture (Ports & Adapters)

프로젝트는 Hexagonal Architecture를 따릅니다:

- **Domain**: 비즈니스 로직과 도메인 모델 (`core/{domain}/domain/`)
- **Application**: Use Case 구현 (`core/{domain}/application/`)
- **Ports**: 인터페이스 정의
  - **In Ports**: Use Case 인터페이스 (`core/{domain}/application/port/in/`)
  - **Out Ports**: Repository/Adapter 인터페이스
    (`core/{domain}/application/port/out/`)
- **Adapters**: 외부 시스템과의 통신 (`core/{domain}/adapter/out/`)
- **Controllers**: API 엔드포인트 (`app/api/{domain}/`)

### 의존성 방향

Hexagonal Architecture의 핵심 원칙은 **의존성 방향**입니다:

- **Domain은 Application을 모릅니다**: Domain 계층은 가장 안쪽 계층으로, 다른
  계층에 의존하지 않습니다. 순수한 비즈니스 로직과 도메인 모델만 포함합니다.
- **Application은 Adapter를 모릅니다**: Application 계층은 Port(인터페이스)를
  통해서만 외부와 통신합니다. 구체적인 Adapter 구현을 직접 알지 않습니다.
- **Adapter는 Application과 Domain을 알 수 있습니다**: Adapter는 Port
  인터페이스를 구현하고, Application과 Domain을 사용합니다.

이러한 의존성 방향을 통해:

- Domain과 Application은 외부 기술에 독립적입니다
- Adapter를 쉽게 교체할 수 있습니다 (예: InMemory → Persistence)
- 테스트가 용이합니다 (Mock Adapter 사용 가능)

### 계층형 컨트롤러/서비스 패키지 스타일

한 개의 메소드만 갖는 계층형 컨트롤러/서비스 패키지 스타일을 사용합니다. 참고:
https://johngrib.github.io/wiki/article/hierarchical-controller-package-structure/

## 파일 구조

```
core/
  {domain}/
    domain/           # 도메인 모델 및 스키마
    application/      # Use Case 구현
      port/
        in/          # Use Case 인터페이스
        out/         # Repository 인터페이스
    adapter/
      out/           # Repository 구현 (Persistence, InMemory 등)

app/
  index.ts           # 서버 시작
  serverApp.ts       # OpenAPIHono 구성, basePath('/api'), middleware/error/docs, 컨트롤러 등록
  api/
    {domain}/
      .../{Action}{Domain}Controller.ts  # API 컨트롤러 (API 경로에 맞는 디렉토리 구조)

lib/db/
  schema.ts          # 데이터베이스 스키마
  drizzle.ts         # 데이터베이스 연결

test/api/
  {domain}/
    .../{Action}{Domain}Controller.int.test.ts  # 통합 테스트
```

## 네이밍 컨벤션

### 파일명

- **클래스 파일**: PascalCase (예: `ArticlePersistenceAdapter.ts`)
- **컨트롤러**: `{Action}{Domain}Controller.ts` (예:
  `CreateArticleController.ts`)
- **Use Case**: `{Action}{Domain}UseCase.ts` (예: `CreateArticleUseCase.ts`)
- **테스트**: `{FileName}.int.test.ts` 또는 `{FileName}.unit.test.ts`

### 변수명

- **camelCase**: 일반 변수, 함수, 메서드
- **PascalCase**: 클래스, 인터페이스, 타입
- **UPPER_SNAKE_CASE**: 상수
- **snake_case**: 데이터베이스 컬럼명

### 테이블명

- **단수형 사용**: `article`, `user` (복수형 `articles`, `users` 사용하지 않음)
- **변수명도 단수형**: `export const article = mysqlTable(...)`

### 인덱스명

- **Unique Index**: `ux_{table}_{column}` 형식 (예: `ux_user_ulid`,
  `ux_user_login_id`)
- **Index**: `ix_{table}_{column}` 형식 (예: `ix_user_name`)

## Import 규칙

### Import 순서

1. 절대 경로 (`@/`) 먼저
2. 외부 라이브러리
3. 상대 경로 (최소화)

### 타입 Import

- 타입만 import할 때는 `import type` 사용
- 예:
  `import type { ArticleQueryPort } from "@/core/article/application/port/out/ArticleQueryPort.ts";`

### Import 그룹화

```typescript
// 1. 절대 경로 - 도메인/인터페이스
import type { ArticleCommandPort } from "@/core/article/application/port/out/ArticleCommandPort.ts";
import type { Article } from "@/core/article/domain/Article.ts";

// 2. 절대 경로 - 공통
import { DomainNotFoundError } from "@/core/common/domain/DomainNotFoundError.ts";
import { Autowired } from "@/core/config/Autowired.ts";

// 3. 외부 라이브러리
import { eq } from "drizzle-orm";

// 4. 상대 경로 (최소화)
import { article } from "@/lib/db/schema.ts";
```

## 타입 정의

### Zod Schema

- 도메인 모델은 Zod schema로 정의
- OpenAPI 메타데이터 포함 (`.openapi({ description: "..." })`)
- 타입은 `z.infer<typeof schema>`로 추론

```typescript
export const articleSchema = z.object({
  id: z.number().openapi({ description: "The article id" }),
  title: z.string().openapi({ description: "The article title" }),
  // ...
}).openapi({ description: "The article schema" });

export type Article = z.infer<typeof articleSchema>;
```

### Schema 변형

- Creation: `.omit({ id: true, createdAt: true, updatedAt: true })`
- Update: `.partial()`
- List: `z.object({ content: schema.array() })`

## 데이터베이스 스키마

### 테이블 정의

- `mysqlTable` 사용 (MySQL)
- 테이블명은 단수형
- 컬럼명은 snake_case

```typescript
export const article = mysqlTable("article", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

### Unique Index

- 배열 형태로 정의
- `ux_{table}_{column}` 형식

```typescript
}, (table) => [
  uniqueIndex('ux_user_ulid').on(table.ulid),
  uniqueIndex('ux_user_login_id').on(table.loginId),
]);
```

### ULID

- 외부 노출용 식별자로 ULID 사용
- `ulid` 패키지 사용 (`ulid()` 함수)
- 26자 varchar, unique constraint

## API 컨트롤러

### 구조

```typescript
import { createRoute } from "@hono/zod-openapi";
import { Controller } from "@/app/api/config/Controller.ts";

const route = createRoute({
  method: "post",
  path: "/articles",
  security: [{ bearerAuth: [] }],
  tags: ["articles"],
  request: {/* ... */},
  responses: {/* ... */},
});

export default Controller().openapi(route, async (c) => {
  // 구현
});
```

### 규칙

- `createRoute`로 route 정의
- `Controller()` 팩토리 사용
- `tags` 배열에 도메인명 추가 (복수형: `['articles']`)
- `security`에 `bearerAuth` 포함 (인증 필요한 경우)
- `applicationContext().get("UseCaseName")`으로 Use Case 호출

### 디렉토리 구조

- 컨트롤러는 API 경로에 맞게 디렉토리 구조를 가집니다
- 예: `POST /api/users/signup` → `app/api/users/signup/SignUpController.ts`
- 예: `GET /api/users/me` → `app/api/users/me/GetCurrentUserController.ts`
- 테스트 파일도 동일한 디렉토리 구조를 따릅니다
- 예: `test/api/users/signup/SignUpController.int.test.ts`

## 의존성 주입

### Autowired 데코레이터

- `@Autowired("BeanName")` 사용
- `beanConfig.ts`에 Bean 정의

```typescript
constructor(
  @Autowired("ArticleQueryPort")
  private readonly articleQueryPort: ArticleQueryPort
) { }
```

### Bean 등록

- `beanConfig.ts`에서 모든 Bean 정의

## 데이터베이스 접근 및 트랜잭션

### SqlOptions

- drizzle은 Spring Boot와 달리 트랜잭션 읽기전용 여부(replica 사용 여부)를
  thread local로 관리하지 않으므로 명시적으로 설정을 전달해야 합니다.
- `useReplica: boolean` 속성을 포함합니다.
- **읽기 전용 로직**: 매개변수로 `SqlOptions`를 받아 가장 바깥쪽에서 읽기전용
  여부를 선택할 수 있게 합니다.
- **쓰기 로직**: `SqlOptions`를 매개변수로 받지 않고 항상 Primary DB를
  사용하도록 강제합니다.

### TransactionTemplate

- 모든 데이터베이스 쿼리는 `TransactionTemplate`의 `execute` 메서드 내에서
  실행되어야 합니다.
- 첫 번째 인자로 `SqlOptions`를 전달하여 읽기 전용 여부를 명시합니다.
- 두 번째 인자인 람다 함수의 매개변수는 `tx`를 사용합니다 (transaction의 약자).

```typescript
async findByUlid(ulid: string, sqlOptions: SqlOptions): Promise<User | null> {
  return this.transactionTemplate.execute(sqlOptions, async (tx) => {
    const results = await tx.select().from(user).where(eq(user.ulid, ulid)).limit(1);
    return results[0] ?? null;
  });
}
```

## 에러 처리

### Domain Error

- `DomainNotFoundError`: 리소스를 찾을 수 없을 때
- `DomainUnauthorizedError`: 인증 실패 시
- `DomainInternalServerError`: 내부 서버 에러 (데이터베이스 에러 등)
- `ApiError`: API 응답용 에러 포맷

### 데이터베이스 에러 처리

- Drizzle ORM에 접근하는 Adapter 클래스는 생성자에서
  `withDatabaseErrorHandling`을 사용하여 자기 자신을 Proxy로 래핑해야 합니다.
- 이를 통해 데이터베이스 쿼리 에러가 발생하면 자동으로 로그를 남기고
  `DomainInternalServerError`를 throw합니다.
- 민감한 정보(쿼리, 파라미터 등)는 서버 로그에만 기록되고, 클라이언트에는
  일반적인 에러 메시지만 전달됩니다.

```typescript
export class UserPersistenceAdapter implements UserCommandPort, UserQueryPort {
  constructor(
    @Autowired("TransactionTemplate") private readonly transactionTemplate:
      TransactionTemplate,
  ) {
    // 생성자에서 자기 자신을 Proxy로 래핑하여 반환
    return withDatabaseErrorHandling(this);
  }

  // 메서드들...
}
```

## Deno 런타임

- 실행/개발: `deno.json`의 task 사용 (`deno task dev`, `deno task start`)
  - 기본 포트: `8080`
  - 포트 변경: `deno task start --port=3031` (내부적으로 `app/index.ts`가
    `--port`를 파싱)
- 테스트: `deno task test`, `deno task intTest`
  - `intTest`는 서버를 먼저 띄운 뒤 테스트를 실행합니다 (`start-server-and-test`
    사용)
- OpenAPI 문서: `app/serverApp.ts`에서 제공하며, `PROFILE !== 'prod'`일 때만
  활성화됩니다.
  - `/api/swagger`: OpenAPI JSON
  - `/api/docs`: Scalar UI

## 테스트

### 파일명

- 통합 테스트: `{FileName}.int.test.ts`
- 단위 테스트: `{FileName}.unit.test.ts`

### 구조

```typescript
import { beforeAll, describe, it } from "@std/testing/bdd";
import pactum from "pactum";

import { intTestDefaultOptions } from "@/test/intTestDefaultOptions.ts";
import { setupIntTest } from "@/test/setupIntTest.ts";

const spec = pactum.spec;

describe("POST /api/articles", intTestDefaultOptions, () => {
  beforeAll(() => {
    setupIntTest();
  });

  it("should return 200", async () => {
    await spec()
      .post("/api/articles")
      .expectStatus(200);
  });
});
```

### 규칙

- `pactum` 사용
- `import pactum from "pactum"` 형태로 import하고 `pactum.spec()`로 요청을
  구성합니다.
- 통합 테스트는 `beforeAll(() => setupIntTest())`로
  `pactum.request.setBaseUrl(...)`을 1회 설정합니다. (`test/setupIntTest.ts`)
- `describe`는 엔드포인트 경로
- `it`은 시나리오 설명

## 코드 스타일

### 함수 반환

- 명시적 반환 타입 사용
- `Promise<T>` 타입 명시

### 조건부 속성

- 객체 스프레드로 조건부 속성 추가

```typescript
.set({
  ...(articleData.title !== undefined && { title: articleData.title }),
  updatedAt: new Date(),
})
```

### 주석

- 복잡한 로직에만 주석 추가
- TODO/FIXME는 최소화

## 환경 변수

### 네이밍

- `DB_PRIMARY_URL`, `DB_REPLICA_URL`: 데이터베이스 연결
- `USE_MOCK_ADAPTER`: Mock Adapter 사용 여부 (기본값: false)

### 타입 안전성

- `zod`로 스키마 정의
- `env.ts`에서 파싱 및 검증

## 문서화

### 기능 문서화

- 코드 변경사항이 있을 때 `docs/features/` 디렉토리 하위에 변경사항을
  문서화합니다
- 기획문서 수준으로 작성하며, 너무 자세한 구현 디테일은 포함하지 않습니다
- 주요 내용:
  - 기능 개요
  - API 엔드포인트 및 사용법
  - 주요 동작 방식
  - 보안 고려사항
  - 에러 처리
- 파일명: `docs/features/{feature-name}.md` (예: `docs/features/auth.md`)

## 코드 품질 관리

### Lint 실행

- 작업이 끝나면 아래를 실행하여 코드 품질을 확인합니다:
  - `deno fmt`
  - `deno lint`
  - (필요 시) `deno check`
- 에러가 발생하면 수정한 후 다시 실행합니다
