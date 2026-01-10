# Next.js Fullstack Opinionated

Next.js만으로 웹페이지와 Rest API를 함께 제공할 때 사용할 수 있는 예시 프로젝트입니다.

백엔드 개발자 입장에서 Next.js를 Spring Boot와 비교했을 때 부족한 부분을 제 의견대로(opinionated) 채워넣었습니다.

## Tech Stack Comparison

|                             | Spring Boot                           | Next.js Fullstack Opinionated |
|-----------------------------|---------------------------------------|-------------------------------|
| 웹 계층                     | spring-webmvc                         | Next.js, Hono                 |
| 코드 기반 OpenAPI Spec 생성 | springdoc-openapi-starter-webmvc-ui   | @hono/zod-openapi             |
| Request Validtaion          | spring-webmvc, spring-boot-validation | Hono, zod                     |
| Exception Handling          | spring-mvc(`@ControllerAdvice`)       | Hono의 `onError()`            |
| IoC Container               | spring-core                           | inversify, inversify-typesafe |
| ORM                         | spring-data-jpa                       | drizzle                       |
| Query Read Write Split      | spring-data-jpa                       | drizzle                       |
| DDL Migration               | flyway                                | drizzle                       |
| Auth                        | spring-security                       | Hono (Middleware 사용)        |
| Unit Test                   | jUnit                                 | Vitest                        |
| Integration Test            | jUnit, `@SpringBootTest`              | Vitest, start-server-and-test |
| Web Test Client             | MockMvc, RestTestClient               | pactum                        |

## Infrastructure Recommendation

- 제품 초기(월 $1,500 미만): Vercel(with Observability Plus for logging) + PlanetScale
  - Vercel: 다른 Serverless Edge Hosting 서비들과 비교했을 때 비용이 많이 비싼편은 아님. AWS Amplify와는 거의 비슷한 비용이 나온다.
  - PlanetScale: 초기 비용이 저렴한(=AWS, GCP 제외) MySQL, Postgres 호환 Serverless RDBMS Platform 중에서 유일하게 Seoul 리전이 있음
  - 초기부터 API 트래픽이 많을 것으로 예상한다면 백엔드만 따로 떼서 Hono만으로 서빙하는 것을 추천 ([Hono on AWS Lambda](https://hono.dev/docs/getting-started/aws-lambda))
- 제품 성숙기(월 $1,500 이상): AWS ECS Fargate, CloudWatch(혹은 Grafana 및 OpenTelemetry 스펙 구현된 제품을 Self Hosting), Amazon Aurora
  - AWS ECS Fargate: EC2나 ECS on EC2보다 설정 및 관리비용이 적게 듦. 
  - Amazon Aurora: 든든. 애플리케이션과의 통신을 VPC내에서 해결하면 데이터 전송 비용 절감 가능. Workload에 따라 Aurora Serverless 고려.
  - 웹페이지 호출보다 API호출이 많은 프로젝트라면 마찬가지로 백엔드만 따로 떼서 Hono만으로 서빙하는 것을 추천

※ 제품 초기, Vercel보다 Cloudflare Pages가 비용은 훨씬 저렴하지만 한국의 망 사용료 문제때문에 Enterprise Plan이 아니면 Los Angeles에서 실행된다. DB가 서울에 있을 때 웹 페이지 로딩 1초씩 걸림

※ 제품 성숙기, AWS ECS보다 AWS App Runner가 사용하기 훨씬 더 간단하지만 Seoul 리전에서는 제공 안 함. Tokyo 리전이 가장 가까움. Seoul 리전에서 서비스 제공하기 시작하면 고려해볼만 하다.

※ 제품 성숙기, PlanetScale에서 Amazon Aurora로 데이터 이전시 AWS Database Migration Service 활용 가능

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

## Why?

TBD

- AI시대, AI가 Java, Kotlin 코드보다 타입스크립트 코드를 잘 짬: https://chatgpt.com/share/695fccfd-e1a8-8004-9c40-bde551d16c32
- 타입스크립트 타입 추론 기능을 활용해서 컴파일타임에 오류를 많이 잡아낼수록 AI가 좋은 코드를 생성함. eslint와 타입스크립트 컴파일러를 AI가 실행해서 스스로 문제 해결 가능.
  - inversify-typesafe, inversify-typesafe-spring-like 프로젝트 소개
  - [Hono is typesafe.](https://hono.dev/docs/concepts/developer-experience)
- JVM 언어보다 컴파일 및 초기 실행 시간이 짧기 때문에 AI에게 보다 빠른 피드백 루프를 제공할 수 있음.
- Next.js의 Fullstack Framework로서의 성숙. 프로젝트 초기에 Next.js로 monolithic하게 Vercel 위에서 서비스를 제공해도 꽤 큰 트래픽까지 버틸 수 있어보인다.
  - 트래픽이 커지면 웹페이지용, Rest API 제공용, 어드민용 등으로 쪼개서 서비스를 제공하면 됨.
  - Serverless가 필연적으로 갖는 Cold Start 문제를 해결하기 위해 Next.js와 Vercel에서 다양한 노력을 함: https://vercel.com/kb/guide/how-can-i-improve-serverless-function-lambda-cold-start-performance-on-vercel
    - 특히 Fluid Compute: https://vercel.com/docs/fluid-compute#how-to-enable-fluid-compute
- 인프라 유지관리 비용을 최소화 할 수 있음. AWS EC2를 쓰는 대신 Vercel과 PlanetScale로 프로젝트를 시작하면 순식간에 인프라 설정 완료.
  - 현재 재직중인 회사의 성격(IT 컨설팅)상 신규 프로젝트가 많고, 대규모 트래픽을 받지 않는 성격의 서비스들을 구현할 때도 많음. Next.js, Vercel, PlanetScale 수준에서 고객사의 문제를 해결할 수 있는 경우가 많다. Next.js를 쓰면서도 Spring Boot의 Developer Experience를 최대한 유지하는 것이 이 예시 프로젝트의 역할
    - Inversify를 사용해서 IoC Container로 백엔드 로직을 관리하므로 기존 Spring Boot의 아키텍처와 유사하게 관리 가능.
    - Next.js의 Routing까지는 Functional Paradigm, Route Handler에서 비즈니스 로직을 호출할 때부터는 Object-Oriented Paradigm이다.
- Next.js만으로 Rest API를 제공할 수 있지만, Next.js가 벤치마크상 성능이 좋지 않다(https://dev.to/encore/nextjs-vs-encorets-when-should-you-not-use-nextjs-for-backend-126p). 언제든제 백엔드 부분만 따로 떼어낼 수 있도록 Next.js 안에서 Hono가 API Routing을 담당하는 형태로 구현함.
  - fyi) Next.js를 백엔드 API 제공용으로 사용하는건 어떻냐고 하니 쏟아진 수많은 악플들: https://www.reddit.com/r/nextjs/comments/1ooxe77/anyone_using_nextjs_on_vercel_purely_as_an_api/
  - 언제든지 Next.js를 떼어내고 백엔드 API만 서빙하는 애플리케이션을 만들 수 있도록 Next.js 내부에서 Hono를 사용하는 구조를 만들었다.
  - Hono는 처음부터 Serverless Runtime 위에서 실행되는 것을 목표로 제작한 프레임워크. 
  - 웹페이지와 백엔드 API를 한꺼번에 서빙하는 monolithic 구조가 유리한 프로젝트는 이대로 사용하고, 백엔드 API만 제공하는 프로젝트는 Next.js 없이 Hono만으로 구현.
  - 백엔드 API만 제공하는 프로젝트는 Vercel이 아니라 프로젝트 시작부터 AWS Lambda에 배포하는 것도 나쁘지않다: https://hono.dev/docs/getting-started/aws-lambda
    - AWS Lambda가 Vercel보다 호출횟수당 비용이 1/10 수준 (Vercel: $2 per 1M, AWS Lambda: $0.2 per 1M)
  - ColdStart를 극단적으로 줄이려면 Deno사용 가능: https://deno.com/blog/aws-lambda-coldstart-benchmarks
    - https://deno.com/blog/build-database-app-drizzle


## TODO

- [ ] 로컬에서 MySQL 띄우고 실제로 동작하는 API 구현
  - [ ] InMemory Adapater와 Persistence Adapter로 분리해서 Profile에 따라 사용하기. remote에서는 InMemory로.
  - [ ] OpenAPI Spec 받아서 Postman으로 테스트
- [ ] backend-only 브랜치 만들어서 Next.js 제거하고 Hono만 사용하는 애플리케이션 구성
  - main 브랜치 커밋 생길 때마다 rebase하기
- [ ] [saas-starter](https://github.com/nextjs/saas-starter) 참고해서 프론트엔드 인증 구현
- [ ] 게시판 목록 조회, 상세 조회, 글 작성, 글 수정, 글 삭제, 로그인, 로그아웃 기능 구현
- [ ] Deno 위에서도 잘 작동하는지 테스트

## Branch 관리

1. 애플리케이션 로직 관련 업데이트는 main 브랜치에서 한다.
2. 파생 브랜치로의 변경사항은 rebase를 한다.
  1. main -> backend-only -> backend-only-deno 순서로 rebase하고 force push