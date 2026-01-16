# Next.js Fullstack Opinionated

Next.js만으로 웹페이지와 Rest API를 함께 제공할 때 사용할 수 있는 예시
프로젝트입니다.

백엔드 개발자 입장에서 Next.js를 Spring Boot와 비교했을 때 부족한 부분을 제
의견대로(opinionated) 채워넣었습니다.

## Run

```bash
git clone https://github.com/myeongjae-kim/nextjs-fullstack-opinionated.git
npm i -g start-server-and-test # 통합테스트용
deno install
deno run setup
docker-compose up -d # 로컬 개발환경(MySQL) 실행
deno run db:migrate:local
deno run dev
```

※ [ni](https://github.com/antfu-collective/ni)를 사용하면 npm, yarn, deno등
패키지 매니저 상관없이 커맨드 입력 가능

## Infra

### Docker에서 실행해보기 위한 커맨드

```bash
deno run build
deno run run-image
```

### Docker 이미지 생성시 주의사항

- Lambda 컨테이너 런타임은 일반적으로 **파일 시스템이 read-only**이며,
  **`/tmp`만 writable**입니다.
  - 따라서 Deno 캐시 경로(`DENO_DIR`)는 `/tmp`를 사용해야 합니다.
- Cold Start 시간을 줄이기 위해, Docker build 단계에서 **의존성을 미리
  캐싱(prewarm)** 합니다.
  - `Dockerfile`에서 `DENO_DIR=/var/deno_dir_seed deno cache app/index.ts`로
    의존성을 받아서 이미지에 굽고,
  - 런타임에는 `infra/lambda-entrypoint.sh`가 `/var/deno_dir_seed`를
    `/tmp/deno_dir`로 복사하여 재사용합니다.
- **실행 시점에 추가 다운로드가 발생하는 라이브러리**가 있으면
  `deno cache`만으로는 충분하지 않을 수 있습니다.
  - 예: `@felix/bcrypt`는 실행 시점에 플랫폼별 네이티브 바이너리(`.so`)를
    다운로드합니다.
  - 이런 의존성이 추가되면, `Dockerfile`에 해당 라이브러리를 **한 번 실제
    실행하는 prewarm step**(예: `deno eval ...`)을 추가해야 런타임
    다운로드/지연을 피할 수 있습니다.
- 런타임 다운로드가 발생하는지 빠르게 확인하려면 아래 task를 실행합니다.
  - `deno task detect-runtime-downloads`
  - 이 task는 `deno cache app/index.ts`를 먼저 수행한 뒤에도, 실제 실행 중에
    추가로 다운로드되는 URL만 출력합니다.

### AWS Lambda의 ColdStart 시간 최적화

- Lambda 컨테이너 이미지는 새 버전을 처음 실행할 때 ECR에서 이미지를 pull하면서
  Cold Start 시간이 증가할 수 있습니다.
- Provisioned Concurrency를 사용하면 이미지를 미리 pull하고 런타임 초기화를
  완료한 상태로 실행 환경을 준비하므로, 실제 사용자 요청에서는 Cold Start가
  거의 노출되지 않습니다.
- 운영 트래픽은 alias(예: `prod`)로만 전달하고, 새 버전에 Provisioned
  Concurrency가 준비된 뒤 alias를 전환하면 배포 직후의 단 한번 Cold Start도
  사용자에게 노출되지 않습니다.

#### Alias 전환 + Provisioned Concurrency 설정 예시

```bash
# 1) 이미지 업데이트
aws lambda update-function-code --function-name MyFunc --image-uri <new-image>

# 2) 새 버전 발행
aws lambda publish-version --function-name MyFunc

# 3) 새 버전에 Provisioned Concurrency 설정
aws lambda put-provisioned-concurrency-config \
  --function-name MyFunc \
  --qualifier <newVersion> \
  --provisioned-concurrent-executions N

# 4) 준비 완료 확인
aws lambda get-provisioned-concurrency-config \
  --function-name MyFunc \
  --qualifier <newVersion>

# 5) alias 전환
aws lambda update-alias --function-name MyFunc --name prod --function-version <newVersion>

# 6) alias용 Function URL 생성/갱신
aws lambda create-function-url-config --function-name MyFunc --qualifier prod --auth-type NONE
# 이미 존재하면 갱신
aws lambda update-function-url-config --function-name MyFunc --qualifier prod --auth-type NONE
```

#### CodeDeploy 기반 무중단 전환 플로우

- CodeDeploy로 Lambda 배포 시 **pre-traffic hook**에서 새 버전의 준비 완료를
  확인한 뒤 트래픽을 전환합니다.
- alias는 CodeDeploy가 관리하며, 성공 시 자동으로 새 버전을 가리킵니다.

```text
배포 아티팩트 생성 → CodeDeploy 배포 시작
→ pre-traffic hook에서 Provisioned Concurrency 준비 상태 확인
→ 성공 시 alias 트래픽 전환
→ 실패 시 자동 롤백
```

### AWS 인프라

`infra/terraform` 디렉토리 이하에서 terraform으로 관리합니다.

```bash
npm i -g aws-cdk
cd infra/cdk
```

## Tech Stack Comparison

|                             | Spring Boot                           | Next.js Fullstack Opinionated |
| --------------------------- | ------------------------------------- | ----------------------------- |
| 웹 계층                     | spring-webmvc                         | Next.js, Hono                 |
| 코드 기반 OpenAPI Spec 생성 | springdoc-openapi-starter-webmvc-ui   | @hono/zod-openapi             |
| Request Validtaion          | spring-webmvc, spring-boot-validation | Hono, zod                     |
| Exception Handling          | spring-mvc(`@ControllerAdvice`)       | Hono의 `onError()`            |
| IoC Container               | spring-core                           | inversify, inversify-typesafe |
| ORM                         | spring-data-jpa                       | drizzle                       |
| Read-Write Splitting        | spring-data-jpa                       | drizzle                       |
| DDL Migration               | flyway                                | drizzle                       |
| Auth                        | spring-security                       | Hono (Middleware 사용)        |
| Unit Test                   | jUnit                                 | Vitest                        |
| Integration Test            | jUnit, `@SpringBootTest`              | Vitest, start-server-and-test |
| Web Test Client             | MockMvc, RestTestClient               | pactum                        |

## Motivation

1. AI는 Java나 Kotlin보다 TypeScript와 더
   친숙하다(https://chatgpt.com/share/695fccfd-e1a8-8004-9c40-bde551d16c32).
   AI가 더 잘 할 수 있게 백엔드 기술 스택을 TypeScript로 변경하는 것도 좋은
   선택이지 않을까?
   1. TypeScript의 강력한 타입 시스템도 AI가 코드를 더 잘 작성할 수 있게 해준다.
      TypeScript 컴파일러와 eslint는 AI에게 훌륭한 피드백을 제공함. TypeScript의
      타입 연산 및 추론 기능, Literal String 등 고급 타입 기능과, 빡빡하게
      설정한 eslint는 컴파일타임에 에러를 더 많이 잡아내 AI에게 빠른 피드백
      루프를 제공한다 (fyi: https://type-level-typescript.com/).
2. 중소형 프로젝트나 어드민 성격의 제품은 Next.js 하나로 백엔드에서 DB접근이나
   API까지 구현해도 무리가 없음. Vercel과 PlanetScale 클릭 몇 번으로 인프라를
   구축할 수 있어서 빠르게 초기 셋팅을 끝낼 수 있다. Node.js 환경의 Hot
   Reloading 덕분에 개발 속도도 빠르다.
3. 대형 프로젝트도 Next.js로 제공할 수 있을까?
   1. [API Layer로서 Next.js는 성능이 좋지 않다](https://dev.to/encore/nextjs-vs-encorets-when-should-you-not-use-nextjs-for-backend-126p).
      어느정도 트래픽이 되면 API만 제공하는 웹서버를 분리해야 함.
   2. Next.js에서 백엔드 API만 똑 떼어낼 수 있을까? -> Hono
      ([Motivation](https://hono.dev/docs/concepts/motivation),
      [Hono on Next.js](https://hono.dev/docs/getting-started/nextjs))
   3. 백엔드 로직을 객체지향적으로 관리해 익숙한 방식으로 복잡도를 통제하고 싶다
      -> [inversify](https://github.com/inversify),
      [inversify-typesafe](https://github.com/myeongjae-kim/inversify-typesafe),
      [inversify-typesafe-spring-like](https://github.com/myeongjae-kim/inversify-typesafe/tree/main/packages/inversify-typesafe-spring-like)
4. 응답속도와 처리량이 중요한 프로젝트에도 사용할 수 있을까? ->
   [Hono on Node.js](https://hono.dev/docs/concepts/benchmarks#on-node-js),
   [Hono on Deno](https://hono.dev/docs/concepts/benchmarks#deno)
   1. 이 정도면 웹서버 성능이 병목이 될 일은 없어보인다.
   2. [Benchmarking AWS Lambda Cold Starts Across JavaScript Runtimes](https://deno.com/blog/aws-lambda-coldstart-benchmarks)

## Infrastructure Recommendation

- 제품 초기(월 $1,500 미만): Vercel(with Observability Plus for logging) +
  PlanetScale
  - Vercel: 다른 Serverless Edge Hosting 서비들과 비교했을 때 비용이 많이
    비싼편은 아님. AWS Amplify와는 거의 비슷한 비용이 나온다.
  - PlanetScale: 초기 비용이 저렴한(=AWS, GCP 제외) MySQL, Postgres 호환
    Serverless RDBMS Platform 중에서 유일하게 Seoul 리전이 있음
  - 초기부터 API 트래픽이 많을 것으로 예상한다면 백엔드만 따로 떼서 Hono만으로
    서빙하는 것을 추천
    ([Hono on AWS Lambda](https://hono.dev/docs/getting-started/aws-lambda))
- 제품 성숙기(월 $1,500 이상): AWS ECS Fargate, CloudWatch(혹은 Grafana 및
  OpenTelemetry 스펙 구현된 제품을 Self Hosting), Amazon Aurora
  - AWS ECS Fargate: EC2나 ECS on EC2보다 설정 및 관리비용이 적게 듦.
  - Amazon Aurora: 든든. 애플리케이션과의 통신을 VPC내에서 해결하면 데이터 전송
    비용 절감 가능. Workload에 따라 Aurora Serverless 고려.
  - 웹페이지 호출보다 API호출이 많은 프로젝트라면 마찬가지로 백엔드만 따로 떼서
    Hono만으로 서빙하는 것을 추천

※ 제품 초기, Vercel보다 Cloudflare Pages가 비용은 훨씬 저렴하지만 한국의 망
사용료 문제때문에 Enterprise Plan이 아니면 Los Angeles에서 실행된다. DB가 서울에
있을 때 웹 페이지 로딩 1초씩 걸림

※ 제품 성숙기, AWS ECS보다 AWS App Runner가 사용하기 훨씬 더 간단하지만 Seoul
리전에서는 제공 안 함. Tokyo 리전이 가장 가까움. Seoul 리전에서 서비스 제공하기
시작하면 AWS App Runner를 고려해볼만 하다.

※ 제품 성숙기, PlanetScale에서 Amazon Aurora로 데이터 이전시 AWS Database
Migration Service 활용 가능

<table>
  <thead>
    <tr>
      <td></td>
      <td><strong>제품 초기(월 $1,500 미만)</strong></td>
      <td><strong>제품 성숙기(월 $1,500 이상)</strong></td>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>FullStack</td>
      <td>Vercel,</br>PlanetScale</td>
      <td>AWS ECS Fargate,<br/>Amazon Aurora (Workload에 따라 Aurora Serverless)</td>
    </tr>
    <tr>
      <td>Backend Only</td>
      <td>Vercel or AWS Lambda<br/>(AWS Lambda가 Vercel보다 호출횟수당 비용 1/10),<br/>PlanetScale</td>
      <td>AWS ECS Fargate,<br/>Amazon Aurora (Workload에 따라 Aurora Serverless)</td>
    </tr>
    <tr>
      <td>Backend Only<br/>(High Performance)</td>
      <td>AWS Lambda<br/>(Deno로 ColdStart 시간 최소화),<br/>Amazon Aurora<br/>(Labmda와 VPC 내에서 통신해서 latency 최소화)</td>
      <td>AWS ECS Fargate<br/>(Deno, ECS로 ColdStart 시간 제거),<br/>Amazon Aurora</td>
    </tr>
  </tbody>
</table>

※ Deno의 개발 경험이 Node.js보다 월등하다. Deno는 타입스크립트 런타임이기 때문에
타입스크립트를 자바스크립트로 컴파일하는 과정 때문에 발생하는 이런저런
오버헤드가 없고 작성하는 코드가 그대로 실행된다는 안정감이 있음. linter와
prettier도 자체 내장이라 간편하다.

지금은 Deno 1.0이 릴리즈된지 6년째고 메이저 업그레이드도 한 번 진행해서 현재
최신버전은 2.6.5이다. Slack을 비롯한 여러 업체들에서 production 환경에 Deno를
사용하고 있고 (https://deno.com/showcase), 예시 프로젝트를 작성해보니 기존 npm
라이브러리와 호환도 잘 되어서 큰 불편이 없었다 (1버전에서는 꽤 불편했음). 백엔드
프로젝트를 AWS Lambda 위에 Deno를 올려서 써보는 것도 risk가 크진 않을듯. 예시
코드 참고:
https://github.com/myeongjae-kim/nextjs-fullstack-opinionated/tree/deno

## Why?

### (단위 시간당 가치) = (가치) / (시간), 시간을 줄여보자

단위 시간당 가치(Value) 창출량을 10배, 100배 높이기 위해서는 가치가 큰
일(=분자)을 수행하는 것 뿐만 아니라 소요되는 시간(=분모)을 줄이는 것도
중요합니다. 이미 우리 회사는 사람보다 AI가 사람보다 훨씬 많은 코드를 작성하고
있기 때문에, 이제는 사람이 좋은 코드를 작성하기 위한 노력보다 AI가 좋은 코드를
작성할 수 있는 환경을 만들어야 단위 시간당 가치를 높이는 일에 더 많이 기여할 수
있어 보입니다.

이 저장소는 중소형 프로젝트를 위해 Next.js로 DB 뿐만 아니라 백엔드 API까지
제공하는 예시 코드를 작성하려는 좋겠다는 생각으로 만들었지만, 자료를 수집하고
생각을 정리할수록 프로젝트의 크기에 상관없이 TypeScript를 사용해 기술 스택을
통일하는 것이 좋겠다는 결론에 이르렀습니다.

### AI는 TypeScript를 좋아해

AI에게 Java, Kotlin, TypeScript중 어느 언어가 가장 자신있냐고 물어보면
공통적으로 TypeScript에 가장 자신이 있다고 답변합니다 (GPT-5.2, Gemini 3 Flash,
Grok Code, Sonnet 4.5). TypeScript는 프론트엔드, 백엔드는 물론 여러 분야에
가리지 않고 퍼져있고 인기도 높기 때문에 AI가 학습에 활용할 수 있는 코드의 양이
다른 두 언어보다 '압도적으로(AI가 이렇게 말했음)' 많습니다. 그리고 TypeScript의
강력한 타입 시스템은 AI가 코드를 더 잘 작성할 수 있게 해줍니다. TypeScript의
강력한 타입 연산 및 추론 기능과 Literal String 등 고급 타입 기능과 빡빡하게
설정한 eslint는 컴파일타임에 에러를 더 많이 잡아내 AI에게 빠른 피드백 루프를
제공합니다.

### 인간에게도 빠른 피드백 루프

AI가 작성한 코드의 결과물을 검토해야 할 때마다 직접 로컬 웹 애플리케이션을
종료하고 빌드한 뒤에 다시 실행하는 과정을 거치는 것은 매우 번거롭습니다. Node.js
생태계는 예전부터 Hot Reloading이 보편적이기 되어있기 때문에 AI가 소스코드를
변경하는 즉시 결과물을 확인할 수 있습니다. 현재는 인간이 병목이 되는
개발환경이기 때문에 인간 때문에 발생하는 지연시간을 줄이는 것이 중요합니다.

### TypeScript로 Spring 따라하기

우리 회사의 성격(IT 컨설팅)상 신규 프로젝트가 많고, 대규모 트래픽을 받지 않는
성격의 서비스들을 구현할 때도 많습니다. TypeScript, Next.js, Vercel, PlanetScale
만으로 고객사의 문제를 대부분 해결할 수 있어 보이는데, 다만 아쉬운 점은 Spring
Boot가 제공했던 여러 가지 기능을 대체할 라이브러리를 찾거나 직접 구현해야 한다는
것입니다. 이 저장소는 TypeScript로 프론트엔드와 백엔드 코드를 작성하면서 기존에
Spring Boot가 제공했던 Developer Experience를 최대한 유사하게 만들어보기 위한
노력의 결과입니다.

가장 핵심적인 부분은 inversify라는 IoC 컨테이너를 도입해서 백엔드 코드를
Hexagonal Architecture로 구성했다는 점입니다. Controller - Service -
Repository의 3 Layer Architecture로도 객제치향적인 코드를 작성할 수 있지만, 3
Layer Architecuture보단 Hexagonal Architecture가 더 큰 규모의 코드와 복잡도를
다룰 수 있다고 판단했습니다.

Hexagonal Architecture는 3 Layer Architecture보다 Interface를 많이 만들고
디렉토리 구조도 복잡합니다. 이 아키텍처를 처음 도입해서 코드를 작성해보면
기존보다 boilerplate같은 코드가 많아진다는 느낌을 피할 순 없지만, 특정 코드를
찾아야 할 때 훨씬 더 쉽게 코드를 탐색할 수 있다는 장점이 있습니다. 요새는 AI가
코드를 다 써주기 때문에 특히나 Hexagonal Architecture를 채택하기 좋은 시점인 것
같습니다.

AI가 쏟아내는 많은 분량의 코드를 Hexagonal Architecture를 사용해 구성하면 책
[클린 아키텍처](https://search.shopping.naver.com/book/catalog/32491453506?query=%ED%81%B4%EB%A6%B0%20%EC%95%84%ED%82%A4%ED%85%8D%EC%B2%98&NaPm=ct%3Dmkjv5i3c%7Cci%3D2bca52b6c99fa2a33718203f6f40ab417829851f%7Ctr%3Dboksl%7Csn%3D95694%7Chk%3D52682876ea07203211b63e5209c0deb67a8295ec)의
'소리치는 아키텍처' 챕터가 말하는 장점을 체감해볼 수 있습니다.

이 프로젝트는 Controller layer까지는 Hono(및 여러 JavaScript 웹 프레임워크가
사용하는)의 함수형 프로그래밍 패러다임을 사용하고, Controller 레이어에서
inversify container를 통해 비즈니스 로직인 UseCase를 찾아서 실행합니다.
Spring으로 치면 ApplicationContext에 직접 접근해 bean을 꺼내서 사용한다고
생각하면 됩니다.

Bean을 꺼낼 때는 bean이름과 해당 타입을 제공해야 하는데, 타입스크립트의 타입
추론 기능을 잘 활용하면 bean 이름만 입력해도 자동으로 타입을 찾아줄 수 있을 것
같아서 라이브러리를 작성했습니다:
[inversify-typesafe](https://github.com/myeongjae-kim/inversify-typesafe),
[inversify-typesafe-spring-like](https://github.com/myeongjae-kim/inversify-typesafe/tree/main/packages/inversify-typesafe-spring-like).

(fyi. 타입스크립트에 literal type이 추가되면서
[타입스크립트의 타입 시스템이 튜링-완전하다](https://github.com/microsoft/TypeScript/issues/14833)이
고 증명되었기 때문에 우리가 상상할 수 있는 웬만한 타입 연산은 모두 가능하다고
보면 됩니다)

(fyi2. IoC 컨테이너로 [NestJS](https://nestjs.com/)를 쓰지 않은 이유는, 이
프로젝트에서 웹 레이어를 Next.js나 Hono를 사용할 것이기 때문에 가장 가벼운 IoC
컨테이너를 선택했기 때문입니다. NestJS에서 웹 부분을 제외하고 DI 기능만 쓸 수
있지만(https://docs.nestjs.com/faq/serverless#using-standalone-application-feature),
번들 크기가 inversify보다 3배 무겁고
([inversify: 57.9kB](https://bundlephobia.com/package/inversify@7.10.8),
[@nestjs/core: 189.2kB](https://bundlephobia.com/package/@nestjs/core@11.1.10))
제게 필요했던 기능이 Inversify만으로 충분히 제공됩니다)

### Serverless가 편하긴 해

2014년에 AWS Lambda가 등장하면서 서버리스 컴퓨팅이 산업적으로 주목받기
시작했습니다. 2018년에는 Amazon Aurora Serverless v1이 릴리즈되었고, 2021년
말에는 [PlanetScale](https://planetscale.com/)처럼 개발자 경험을 극대화한
서버리스 RDBMS가 등장해서 커뮤니티의 관심을 받았습니다.

[Next.js](https://nextjs.org/)는 등장부터 풀 스택 리액트 프레임워크로 주목을
받았고, 이제는 다양한 Serverless Edge Hosting 업체들(Vercel, Cloudflare, Netlify
등)을 통해서 풀 스택 리액트 애플리케이션을 간단하게 배포할 수 있는 세상이
되었습니다.

Serverless RDBMS와 Serverless Edge Hosting은 이미 상용 제품에 활발이 사용되고
있습니다. 이 함께 활용하면 전형적인 웹 애플리케이션의 인프라에 필요한 노력을
극단적으로 줄일 수 있습니다. 예를 들어, 별도의 백엔드 API 서버 없이 Next.js의
백엔드에서 Serverless DB에 직접 커넥션을 맺고 데이터를 가져오는 것은 물론
Next.js의 백엔드를 그저 BFF(Backend for Frontend)가 아니라 API를 제공하기 위한
프레임워크로도 사용할 수 있습니다.

Next.js로 풀스택 애플리케이션을 만들어 백엔드와 프론트엔드가 분리되어서 발생하는
오버헤드를 제거하고 Next.js는 Vercel에, DB는 PlanetScale에 올려서 사용하면 현
시점에서 최소한의 노력으로 상용 서비스 인프라를 구축할 수 있습니다.

Serverless가 갖는 태생적인 ColdStart 문제가 있지만 서버리스가 등장한지 10년도
넘은 시점이라 이미 여러 업체들이 ColdStart 시간을 줄이기 위한 솔루션을 제공하고
있습니다. Vercel은 [Fluid compute](https://vercel.com/fluid)라는 개념으로
일반적인 Server과 Serverless의 장점을 합쳐서 제공하고 있습니다.

ColdStart 시간이 적은 기술스택을 사용하는 것도 큰 도움이 됩니다. 이
[벤치마크](https://deno.com/blog/aws-lambda-coldstart-benchmarks#hono-1)를 보면
AWS Lambda 위에서 Deno와 Hono를 사용할 때 ColdStart 시간이 평균 57.6ms에
오차범위 3.4ms가 나옵니다. 이 정도 ColdStart 시간은 일반적인 웹서비스에서 큰
문제가 되지 않습니다.

### Next.js로 모든걸 할 수는 없지만 Hono와 함께라면?

기능적으로는 Next.js로 백엔드 API를 제공할 수 있기 때문에 상용 서비스에 적용해도
문제가 없을까 자료 조사를 하다보니, 이미 비슷한 생각을 하고 올린
[질문](https://www.reddit.com/r/nextjs/comments/1ooxe77/anyone_using_nextjs_on_vercel_purely_as_an_api/)이
있었습니다. 다만 사람들은 왜 Next.js를 API Layer로 사용하냐며 온갖 악플을
남겼고...

실제로
[벤치마크](https://dev.to/encore/nextjs-vs-encorets-when-should-you-not-use-nextjs-for-backend-126p)를
찾아보니 Next.js가 다른 Node.js 웹 프레임워크에 비해 엄청나게 낮은 성능을 보이고
있었습니다.

![](https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fffh2vc7pdw3qooagn5wv.png)

간편하게 배포할 수 있는 Serverless 백엔드 API의 꿈은 이렇게 물거품이 되나
걱정하다가 [Hono](https://hono.dev/)를 찾았습니다.

[Hono는 Cloudflare Workers에서 동작하는 웹서버를 구현하기 위해 작성된
프레임워크](https://hono.dev/docs/concepts/motivation)입니다. 이제는 Cloudflare
Workers 뿐만 아니라 여러 Serverless runtime에서 실행이 가능하고 심지어 Next.js
위에서도 실행이 가능합니다. 프로젝트 초기에 인프라 설정 비용을 최소화하려면
Next.js + Hono로 개발을 시작한 뒤 제품이 성장했을 때 Hono 부분만 떼어내서 백엔드
API 서버를 만듭니다.

이 프로젝트의 main 브랜치는 Next.js + Hono로 구성한 FullStack이지만
[hono 브랜치](https://github.com/myeongjae-kim/nextjs-fullstack-opinionated/tree/node)
는 Next.js를 제거하고 Node.js 위에서 바로 Hono를 사용하는 코드,
[deno 브랜치](https://github.com/myeongjae-kim/nextjs-fullstack-opinionated/tree/deno)는
Deno위에서 바로 Hono를 사용하는 코드를 작성해놨습니다.

웹페이지와 백엔드 API를 한꺼번에 서빙하는 monolithic 구조가 유리한 프로젝트는
Next.js와 Hono를 사용하고, 백엔드 API만 제공하는 프로젝트는 Next.js 없이
Hono만으로 구현하면 됩니다.

### 타입-안전 (Type-Safety)

타입스크립트는 2012년에 출시되었습니다. 제가 개발자로 커리어를 시작한 2010년대
후반에는 자바스크립트에 타입을 도입하는 진통이 거의 마무리가 된 시점이었습니다.
정적 타이핑을 선호하는 조직이라면 큰 걱정 없이 타입스크립트를 재택해도 될만큼
타입스크립트 생태계가 성숙했던 시점이었습니다.

왜 이 말씀을 드리냐면, 현재 2026년은 타입스크립트 라이브러리들이 복잡한 타입
연산과 literal type을 활용한 타입-안전한 기능을 갖추는 것이 더 이상 특별할 일이
아닐 정도로 타입스크립트 생태계가 한 번 더 도약한 시점인 것 같기 때문입니다.

Literal type은 2016년 11월에 타입스크립트 2.1버전에서 도입되었습니다. 그리고
literal type을 이용한 복잡한 복잡한 타입 연산을 가능하게 한 template literal
type 기능은 2020년 11월 4.1버전에서 도입되었습니다. 지금은
[수많은 라이브러리](https://github.com/jellydn/awesome-typesafe)들이 타입 연산을
적극적으로 활용해서 컴파일 타임에 더 많은 에러를 잡아내고 있습니다.

[Hono도 타입-안전을 고려하면서 작성한 라이브러리](https://hono.dev/docs/concepts/developer-experience)라
기존에 JavaScript로 express를 사용했던 경험이 있는 분이라면 Hono를 사용하면서
놀라게 될 순간이 많을거라고 생각합니다. 제가 작성한
[inversify-typesafe](https://github.com/myeongjae-kim/inversify-typesafe)라는
간단한 라이브러리는 기초적인 타입 연산을 활용해 IoC Container에서 bean을 꺼낼 때
타입을 추론해서 기존에 타입을 직접 지정해줘야 했던 불편함과 실수 요소들을
제거했습니다.

AI가 코드를 쏟아내는 지금은 컴파일 타임에 더 많은 에러를 잡아낼수록 더 빠른
개발이 가능합니다. 타입스크립트 세계의 타입-안전 라이브러리들과 eslint등을
활용해서 AI가 활용할 수 있는 셀프 피드백 도구를 제공하면 더 효율적인 개발이
가능합니다.

### Infrastructure 선택 기준에 대하여 (WIP)

위에서 적은 내용 조금 더 풀어서 쓰기 + 비용에 대한 자세한 이야기

- 백엔드 API만 제공하는 프로젝트는 Vercel이 아니라 프로젝트 시작부터 AWS
  Lambda에 배포하는 것도 나쁘지않다:
  https://hono.dev/docs/getting-started/aws-lambda
  - AWS Lambda가 Vercel보다 호출횟수당 비용이 1/10 수준 (Vercel: $2 per 1M, AWS
    Lambda: $0.2 per 1M)
- deno 브랜치에 AWS 배포 예시코드 있음.

### Web Layer는 함수형 패러다임, Business Layer는 객체지향 패러다임 (WIP)

아키텍처 설명. Web Layer에 전혀 영향을 받지 않는 Business Layer -> core
디렉토리.

### 그리운 Spring Boot (WIP)

예시 코드를 작성해보니 Spring Boot에 비해서 직접 채워넣어야 하는 부분이 많았다.
제가 생각하기에 가장 효과적인 형태로 코드를 작성했고, 더 좋은 아이디어가 있다면
기여해주기 바랍니다.

- 코드 훑어보면서 신경써서 작성한 코드 listing.

(위 list를 아래 Code Examples 항목에 추가하기)

### Code Examples (WIP)

## Branch 관리

1. 애플리케이션 로직 관련 업데이트는 main 브랜치에서 한다.
2. 파생 브랜치로의 변경사항은 rebase를 한다.
