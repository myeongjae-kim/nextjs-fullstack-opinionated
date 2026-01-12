# 인증 시스템

## 개요

사용자 인증 및 권한 관리를 위한 JWT 기반 인증 시스템입니다. 회원가입, 로그인, 토큰 갱신 기능을 제공하며, 모든 API 요청에 대한 인증 미들웨어를 통해 보안을 보장합니다.

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

## 인증 방식

### JWT (JSON Web Token)

- **Access Token**: 
  - 만료 시간: 15분
  - 포함 정보: 사용자 ULID, 역할(role)
  - 용도: API 요청 시 인증에 사용

- **Refresh Token**:
  - 만료 시간: 6개월
  - 포함 정보: 사용자 ULID
  - 용도: Access Token 갱신에 사용

### 인증 미들웨어

모든 API 요청은 `authMiddleware`를 통해 인증 여부를 확인합니다.

- **인증 필요 API**: `Authorization: Bearer {access_token}` 헤더 필수
- **인증 불필요 API**: 회원가입, 로그인, 토큰 갱신 등

## 프론트엔드 인증

### Cookie 기반 세션

프론트엔드에서는 Cookie를 사용하여 인증 상태를 관리합니다.

- **쿠키 이름**: `session`
- **쿠키 데이터 타입**: `AuthResponse` (`core/common/domain/AuthResponse.ts`)
  - `{ access_token: string, refresh_token: string }` 형태
- **쿠키 저장**: Access Token과 Refresh Token을 HTTP-only 쿠키에 JSON 형태로 저장
- **쿠키 만료 시간**: Refresh Token 만료 시간과 동일 (6개월)
- **쿠키 속성**: 
  - `httpOnly`: true (JavaScript 접근 불가)
  - `secure`: true (HTTPS에서만 전송, 개발 환경에서는 false 가능)
  - `sameSite`: 'lax' 또는 'strict'
- **자동 갱신**: Access Token 만료 시 Refresh Token을 사용하여 자동 갱신

### 페이지 접근 제어

- **홈 화면 (`/server-actions`)**: 로그인 상태일 때만 접근 가능, 미로그인 시 `/server-actions/login`으로 리다이렉트
- **로그인 페이지 (`/server-actions/login`)**: 로그인하지 않은 상태에서만 접근 가능, 로그인 상태 시 `/server-actions`로 리다이렉트
- **회원가입 페이지 (`/server-actions/signup`)**: 로그인하지 않은 상태에서만 접근 가능, 로그인 상태 시 `/server-actions`로 리다이렉트
- **Proxy**: Next.js 16의 Proxy (`proxy.ts`)를 사용하여 접근 제어
  - 쿠키에서 `session` 쿠키를 읽어 JWT 토큰 검증
  - 토큰이 유효하면 로그인 상태로 판단
  - `/server-actions/*` 경로에 대해 접근 제어 적용

### Server Action

- **회원가입**: `app/server-actions/signup/actions.ts` - SignUpUseCase 직접 호출
- **로그인**: `app/server-actions/login/actions.ts` - LoginUseCase 직접 호출
- **로그아웃**: `app/server-actions/login/actions.ts` - 쿠키 삭제
- **UseCase 직접 호출**: Server Action에서 `applicationContext`를 통해 UseCase 직접 호출
- **회원가입 후 자동 로그인**: 회원가입 성공 시 자동으로 로그인 상태로 전환 (쿠키에 토큰 저장)
- **쿠키 설정**: Server Action에서 `cookies().set()`을 사용하여 `session` 쿠키에 토큰 저장
- **쿠키 데이터**: `AuthResponse` 타입을 JSON.stringify하여 저장

### 로그아웃

- 로그아웃 기능 제공
- 로그아웃 시 쿠키 삭제 및 로그인 페이지로 이동

## 보안 고려사항

### 비밀번호 보안

- 비밀번호는 bcrypt를 사용하여 해싱하여 저장
- 평문 비밀번호는 데이터베이스에 저장되지 않음

### 토큰 보안

- JWT Secret Key는 환경 변수(`AUTH_SECRET`)로 관리
- Access Token은 짧은 만료 시간으로 토큰 탈취 시 피해 최소화
- Refresh Token은 장기간 유효하지만 별도 검증 로직으로 보호

### 사용자 식별자

- 내부 ID 대신 ULID(Universally Unique Lexicographically Sortable Identifier)를 외부에 노출
- ULID는 추측 불가능한 26자 문자열로 구성

## 사용자 역할

현재 시스템은 기본 역할을 지원합니다:

- **member**: 일반 사용자 (기본값)

## 에러 처리

### 인증 실패

- **401 Unauthorized**: 인증 토큰이 없거나 유효하지 않을 때
- **에러 코드**: `CODE_001`
- **에러 타입**: `DOMAIN_UNAUTHORIZED_ERROR`

### 유효성 검증 실패

- **400 Bad Request**: 요청 본문이 유효하지 않을 때 (필수 필드 누락 등)

## 환경 변수

- `AUTH_SECRET`: JWT 토큰 서명에 사용되는 비밀 키 (필수)
