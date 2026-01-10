# Next.js Fullstack Opinionated

Next.js만으로 웹페이지와 Rest API를 함께 제공할 때 사용할 수 있는 예시 프로젝트입니다.

백엔드 개발자 입장에서 Next.js를 Spring Boot와 비교했을 때 부족한 부분을 제 의견대로(opinionated) 채워넣었습니다.

## Tech Stack Comparison

|                             | Spring Boot                           | Next.js Fullstack Opinionated                   |
|-----------------------------|---------------------------------------|-------------------------------------------------|
| 웹 계층                     | spring-webmvc                         | Next.js                                         |
| 코드 기반 OpenAPI Spec 생성 | springdoc-openapi-starter-webmvc-ui   | next-openapi-route-handler                      |
| Request Validtaion          | spring-webmvc, spring-boot-validation | next-openapi-route-handler, zod                 |
| Exception Handling          | spring-mvc(`@ControllerAdvice`)       | next-openapi-route-handler를 활용해서 직접 구현 |
| IoC Container               | spring-core                           | inversify, inversify-typesafe                   |
| ORM                         | spring-data-jpa                       | drizzle                                         |
| Query Read Write Split      | spring-data-jpa                       | drizzle                                         |
| DDL Migration               | flyway                                | drizzle                                         |
| Security                    | spring-security                       | Next.js의 middleware로 직접 구현                |
| Unit Test                   | jUnit                                 | Vitest                                          |
| Integration Test            | jUnit, `@SpringBootTest`              | jUnit, start-server-and-test                    |
| Web Test Client             | MockMvc, RestTestClient               | pactum                                          |

## Infrastructure Recommendation

- 제품 초기(월 $1,500 미만): Vercel(with Observability Plus for logging) + PlanetScale
  - Vercel: 다른 Serverless Edge Hosting 서비들과 비교했을 때 비용이 많이 비싼편은 아님. AWS Amplify와는 거의 비슷한 비용이 나온다.
  - PlanetScale: 초기 비용이 저렴한(=AWS, GCP 제외) MySQL, Postgres 호환 Serverless RDBMS Platform 중에서 유일하게 Seoul 리전이 있음
- 제품 성숙기(월 $1,500 이상): AWS ECS Fargate, CloudWatch(혹은 Grafana 및 OpenTelemetry 스펙 구현된 제품을 Self Hosting), Amazon Aurora
  - AWS ECS Fargate: EC2를 직접 사용하거나 ECS on EC2보다 설정 및 관리비용이 적게 듦. 
  - Amazon Aurora: 든든. 애플리케이션과의 통신을 VPC내에서 해결하면 데이터 전송 비용 절감 가능. Workload에 따라 Aurora Serverless 고려.

※ 제품 초기, Vercel보다 Cloudflare Pages가 비용은 훨씬 저렴하지만 한국의 망 사용료 문제때문에 Enterprise Plan이 아니면 Los Angeles에서 실행된다. DB가 서울에 있을 때 웹 페이지 로딩 1초씩 걸림

※ 제품 성숙기, AWS ECS보다 AWS App Runner가 사용하기 훨씬 더 간단하지만 Seoul 리전에서는 제공 안 함. Tokyo 리전이 가장 가까움. Seoul 리전에서 서비스 제공하기 시작하면 고려해볼만 하다.

※ 제품 성숙기, PlanetScale에서 Amazon Aurora로 데이터 이전시 AWS Database Migration Service 활용 가능

## Why?

TBD

- AI시대, AI가 Java, Kotlin 코드보다 타입스크립트 코드를 잘 짬: https://chatgpt.com/share/695fccfd-e1a8-8004-9c40-bde551d16c32
- 타입스크립트 타입 추론 기능을 활용해서 컴파일타임에 오류를 많이 잡아낼수록 AI가 좋은 코드를 생성함. eslint와 타입스크립트 컴파일러를 AI가 실행해서 스스로 문제 해결 가능.
  - inversify-typesafe, inversify-typesafe-spring-like 프로젝트 소개
- JVM 언어보다 컴파일 및 초기 실행 시간이 짧기 때문에 AI에게 보다 빠른 피드백 루프를 제공할 수 있음.
- Next.js의 Fullstack Framework로서의 성숙. 프로젝트 초기에 Next.js로 monolithic하게 Vercel 위에서 서비스를 제공해도 꽤 큰 트래픽까지 버틸 수 있어보인다.
  - 트래픽이 커지면 웹페이지용, Rest API 제공용, 어드민용 등으로 쪼개서 서비스를 제공하면 됨.
  - Serverless가 필연적으로 갖는 Cold Start 문제를 해결하기 위해 Next.js와 Vercel에서 다양한 노력을 함: https://vercel.com/kb/guide/how-can-i-improve-serverless-function-lambda-cold-start-performance-on-vercel
    - 특히 Fluid Compute: https://vercel.com/docs/fluid-compute#how-to-enable-fluid-compute
- 인프라 유지관리 비용을 최소화 할 수 있음. AWS EC2를 쓰는 대신 Vercel과 PlanetScale로 프로젝트를 시작하면 순식간에 인프라 설정 완료.
  - 현재 재직중인 회사의 성격(IT 컨설팅)상 신규 프로젝트가 많고, 대규모 트래픽을 받지 않는 성격의 서비스들을 구현할 때도 많음. Next.js, Vercel, PlanetScale 수준에서 고객사의 문제를 해결할 수 있는 경우가 많다. Next.js를 쓰면서도 Spring Boot의 Developer Experience를 최대한 유지하는 것이 이 예시 프로젝트의 역할
    - Inversify를 사용해서 IoC Container로 백엔드 로직을 관리하므로 기존 Spring Boot의 아키텍처와 유사하게 관리 가능.
    - Next.js의 Route Handler까지는 Functional Paradigm, Route Handler에서 비즈니스 로직을 호출할 때부터는 Object-Oriented Paradigm이다.