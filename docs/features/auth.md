# 인증 시스템

## 개요

사용자 인증 및 권한 관리를 위한 JWT 기반 인증 시스템입니다. 회원가입, 로그인, 토큰 갱신 기능을 제공하며, 모든 API 요청에 대한 인증 미들웨어를 통해 보안을 보장합니다. 프론트엔드에서는 두 가지 방식(Server Action + Cookie, Client API + localStorage)의 인증 구현 예시를 제공합니다.

## 주요 기능

### 1. 회원가입 (Sign Up)

사용자가 새로운 계정을 생성할 수 있습니다.

- **엔드포인트**: `POST /api/users/signup`
- **인증 필요**: 없음 (PUBLIC)
- **요청 본문**:
  - `loginId` (필수): 사용자 로그인 ID
  - `password` (필수): 사용자 비밀번호
  - `name` (선택): 사용자 이름
- **응답**: Access Token과 Refresh Token 반환

### 2. 로그인 (Login)

기존 사용자가 인증을 받아 토큰을 발급받습니다.

- **엔드포인트**: `POST /api/users/login`
- **인증 필요**: 없음 (PUBLIC)
- **요청 본문**:
  - `loginId` (필수): 사용자 로그인 ID
  - `password` (필수): 사용자 비밀번호
- **응답**: Access Token과 Refresh Token 반환

### 3. 토큰 갱신 (Refresh Token)

만료된 Access Token을 Refresh Token을 사용하여 갱신합니다.

- **엔드포인트**: `POST /api/users/refresh`
- **인증 필요**: 없음 (PUBLIC)
- **요청 본문**:
  - `refresh_token` (필수): Refresh Token
- **응답**: 새로운 Access Token과 Refresh Token 반환

### 4. 현재 사용자 정보 조회

인증된 사용자의 정보를 조회합니다.

- **엔드포인트**: `GET /api/users/me`
- **인증 필요**: 있음 (AUTHORIZE)
- **응답**: 사용자 정보 (ulid, role)

---

## 프론트엔드 인증 방식 1: Server Action 기반 (Cookie Session)

이 방식은 `app/server-actions/` 경로에 구현되어 있으며, Next.js의 Server Action과 HTTP-only 쿠키를 사용합니다.

### Cookie 기반 세션 관리

- **쿠키 이름**: `@nextjs-fullstack-opinionated/session`
- **데이터 타입**: `AuthResponse` (`core/common/domain/AuthResponse.ts`)
  - `{ access_token: string, refresh_token: string }` 형태를 JSON stringify하여 저장
- **보안 속성**: `httpOnly: true`, `secure: true` (운영), `sameSite: 'lax'`, `path: '/'`
- **만료 시간**: Refresh Token 만료 시간과 동일 (180일)

### 페이지 접근 제어 및 토큰 갱신

- **Proxy (Middleware)**: `proxy.ts`를 통해 `/server-actions/*` 경로에 대한 접근을 제어합니다.
  - 쿠키를 읽어 Access Token의 유효성을 검증합니다.
  - Access Token 만료 시 쿠키의 Refresh Token을 사용하여 자동으로 토큰을 갱신하고 쿠키를 업데이트합니다.
  - 인증되지 않은 사용자가 보호된 경로 접근 시 `/server-actions/login`으로 리다이렉트합니다.

### 구현 특징

- **Server Action**: `app/server-actions/login/actions.ts`, `signup/actions.ts`에서 `applicationContext`를 통해 UseCase를 직접 호출합니다.
- **상태 관리**: 서버 측 쿠키에 의존하므로 클라이언트 사이드 상태 동기화 부담이 적습니다.

---

## 프론트엔드 인증 방식 2: API 기반 (localStorage)

이 방식은 `app/use-apis/` 경로에 구현되어 있으며, 클라이언트 사이드 API 호출과 `localStorage`를 사용합니다.

### localStorage 기반 인증 데이터 관리

- **저장 키**: `@nextjs-fullstack-opinionated/authToken`
- **데이터 형태**: 서버에서 받은 `AuthResponse` 객체 전체를 JSON stringify하여 저장합니다.
- **저장 정보**: `access_token`, `refresh_token`

### API 클라이언트 및 인터셉터 (`$api.ts`)

`openapi-fetch`와 `openapi-react-query`를 사용하여 타입 안전한 API 통신을 구현합니다.

- **Request Interceptor**: 모든 요청 전 `localStorage`에서 `authToken`을 읽어 `Authorization: Bearer {access_token}` 헤더를 자동으로 주입합니다.
- **Response Interceptor (자동 토큰 갱신)**: 
  - API 응답이 `401 Unauthorized`인 경우, `localStorage`의 `refresh_token`을 사용하여 `/api/users/refresh`를 호출합니다.
  - 갱신 성공 시 새로운 토큰 정보를 `localStorage`에 업데이트하고, 실패했던 원래 요청을 새 토큰으로 재시도합니다.

### 인증 컨텍스트 (`AuthContext.tsx`)

React Context를 사용하여 애플리케이션 전역의 인증 상태를 관리합니다.

- **상태**: `principal` (사용자 정보), `isAuthenticated`, `isLoading`.
- **훅 기반 관리**: `openapi-react-query`의 `useQuery`로 `/api/users/me` 정보를 유지하고, `useMutation`으로 로그인/회원가입을 처리합니다.
- **동기화**: 로그인/회원가입 성공 시 `localStorage`를 업데이트하고 쿼리를 `refetch`하여 상태를 동기화합니다.

### 페이지 접근 제어

- **AuthGuard**: `app/use-apis/layout.tsx`에서 구현된 클라이언트 사이드 가드입니다.
  - `AuthContext`의 상태를 감시하여 인증되지 않은 사용자를 `/use-apis/login`으로 리다이렉트합니다.
  - 로그인/회원가입 페이지에 인증된 사용자가 접근하면 `/use-apis`로 리다이렉트합니다.

---

## 인증 방식 공통 사항

### JWT (JSON Web Token)

- **Access Token**: 만료 시간 15분, 사용자 ULID 및 역할 포함.
- **Refresh Token**: 만료 시간 6개월, 사용자 ULID 포함.

### 보안 고려사항

- **비밀번호 보안**: bcrypt를 사용하여 해싱 저장.
- **사용자 식별자**: 내부 ID 대신 26자 ULID를 외부에 노출하여 추측 불가능하게 관리.
- **토큰 보안**: 환경 변수(`AUTH_SECRET`)로 JWT 비밀 키 관리.

### 사용자 역할

- **member**: 일반 사용자 (기본값)

### 에러 처리

- **401 Unauthorized**: 인증 토큰 누락 또는 유효하지 않음 (`CODE_001`).
- **400 Bad Request**: 유효성 검증 실패.
- **에러 로그**: catch 블록에서 에러를 무시하는 경우 반드시 `console.error`로 로그를 남기는 것을 원칙으로 합니다.

### 환경 변수

- `AUTH_SECRET`: JWT 토큰 서명에 사용되는 비밀 키 (필수).
