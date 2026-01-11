# 코딩 컨벤션

이 문서는 프로젝트의 코딩 컨벤션과 아키텍처 패턴을 정리한 것입니다.

## 아키텍처

### Hexagonal Architecture (Ports & Adapters)

프로젝트는 Hexagonal Architecture를 따릅니다:

- **Domain**: 비즈니스 로직과 도메인 모델 (`core/{domain}/domain/`)
- **Application**: Use Case 구현 (`core/{domain}/application/`)
- **Ports**: 인터페이스 정의
  - **In Ports**: Use Case 인터페이스 (`core/{domain}/application/port/in/`)
  - **Out Ports**: Repository/Adapter 인터페이스 (`core/{domain}/application/port/out/`)
- **Adapters**: 외부 시스템과의 통신 (`core/{domain}/adapter/out/`)
- **Controllers**: API 엔드포인트 (`app/api/[...route]/{domain}/`)

### 의존성 방향

Hexagonal Architecture의 핵심 원칙은 **의존성 방향**입니다:

- **Domain은 Application을 모릅니다**: Domain 계층은 가장 안쪽 계층으로, 다른 계층에 의존하지 않습니다. 순수한 비즈니스 로직과 도메인 모델만 포함합니다.
- **Application은 Adapter를 모릅니다**: Application 계층은 Port(인터페이스)를 통해서만 외부와 통신합니다. 구체적인 Adapter 구현을 직접 알지 않습니다.
- **Adapter는 Application과 Domain을 알 수 있습니다**: Adapter는 Port 인터페이스를 구현하고, Application과 Domain을 사용합니다.

이러한 의존성 방향을 통해:
- Domain과 Application은 외부 기술에 독립적입니다
- Adapter를 쉽게 교체할 수 있습니다 (예: InMemory → Persistence)
- 테스트가 용이합니다 (Mock Adapter 사용 가능)

### 계층형 컨트롤러/서비스 패키지 스타일

한 개의 메소드만 갖는 계층형 컨트롤러/서비스 패키지 스타일을 사용합니다.
참고: https://johngrib.github.io/wiki/article/hierarchical-controller-package-structure/

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

app/api/[...route]/
  {domain}/
    {Action}{Domain}Controller.ts  # API 컨트롤러

lib/db/
  schema.ts          # 데이터베이스 스키마
  drizzle.ts         # 데이터베이스 연결

test/api/
  {domain}/
    {Action}{Domain}Controller.int.test.ts  # 통합 테스트
```

## 네이밍 컨벤션

### 파일명
- **클래스 파일**: PascalCase (예: `ArticlePersistenceAdapter.ts`)
- **컨트롤러**: `{Action}{Domain}Controller.ts` (예: `CreateArticleController.ts`)
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
- **Unique Index**: `ux_{table}_{column}` 형식 (예: `ux_user_ulid`, `ux_user_login_id`)
- **Index**: `ix_{table}_{column}` 형식 (예: `ix_user_name`)

## Import 규칙

### Import 순서
1. 절대 경로 (`@/`) 먼저
2. 외부 라이브러리
3. 상대 경로 (최소화)

### 타입 Import
- 타입만 import할 때는 `import type` 사용
- 예: `import type { ArticleQueryPort } from "./port/out/ArticleQueryPort";`

### Import 그룹화
```typescript
// 1. 절대 경로 - 도메인/인터페이스
import { ArticleCommandPort } from "@/core/article/application/port/out/ArticleCommandPort";
import { Article, ArticleCreation } from "@/core/article/domain/Article";

// 2. 절대 경로 - 공통
import { DomainNotFoundError } from "@/core/common/domain/DomainNotFoundError";
import { Autowired } from "@/core/config/Autowired";

// 3. 외부 라이브러리
import { eq } from "drizzle-orm";

// 4. 상대 경로 (최소화)
import { article } from "@/lib/db/schema";
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
export const article = mysqlTable('article', {
  id: int('id').primaryKey().autoincrement(),
  title: varchar('title', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
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
import { Controller } from "../config/Controller";

const route = createRoute({
  method: 'post',
  path: '/articles',
  security: [{ bearerAuth: [] }],
  tags: ['articles'],
  request: { /* ... */ },
  responses: { /* ... */ },
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
- 예: `POST /api/users/signup` → `app/api/[...route]/users/signup/SignUpController.ts`
- 예: `GET /api/users/me` → `app/api/[...route]/users/me/GetCurrentUserController.ts`
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

## Query Options

### QueryOptions 타입
- Read 쿼리에는 `QueryOptions` 매개변수 사용
- `useReplica: boolean` 속성 포함

```typescript
export interface QueryOptions {
  useReplica: boolean;
}

async findAll(queryOptions: QueryOptions): Promise<Article[]>;
```

## 에러 처리

### Domain Error
- `DomainNotFoundError`: 리소스를 찾을 수 없을 때
- `DomainUnauthorizedError`: 인증 실패 시
- `ApiError`: API 응답용 에러 포맷

## 테스트

### 파일명
- 통합 테스트: `{FileName}.int.test.ts`
- 단위 테스트: `{FileName}.unit.test.ts`

### 구조
```typescript
import { testEnv } from "@/test/testEnv";
import { spec } from "pactum";
import { describe, it } from "vitest";

describe("POST /api/articles", () => {
  it("should return 200", async () => {
    await spec()
      .post("/api/articles")
      .withBearerToken(testEnv.TEST_BEARER_TOKEN)
      .expectStatus(200);
  });
});
```

### 규칙
- `pactum` 사용
- `testEnv`에서 환경 변수 가져오기
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
- `USE_PERSISTENCE_ADAPTER`: Adapter 선택
- `TEST_BEARER_TOKEN`: 테스트용 토큰

### 타입 안전성
- `zod`로 스키마 정의
- `env.ts`에서 파싱 및 검증

## 문서화

### 기능 문서화
- 코드 변경사항이 있을 때 `docs/features/` 디렉토리 하위에 변경사항을 문서화합니다
- 기획문서 수준으로 작성하며, 너무 자세한 구현 디테일은 포함하지 않습니다
- 주요 내용:
  - 기능 개요
  - API 엔드포인트 및 사용법
  - 주요 동작 방식
  - 보안 고려사항
  - 에러 처리
- 파일명: `docs/features/{feature-name}.md` (예: `docs/features/auth.md`)
