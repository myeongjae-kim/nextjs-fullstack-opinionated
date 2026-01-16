import { ArticleMockAdapter } from '@/core/article/adapter/out/ArticleMockAdapter.ts'
import { ArticlePersistenceAdapter } from '@/core/article/adapter/out/ArticlePersistenceAdapter.ts'
import { ArticleCommandService } from '@/core/article/application/ArticleCommandService.ts'
import { ArticleQueryService } from '@/core/article/application/ArticleQueryService.ts'
import { CreateArticleUseCase } from '@/core/article/application/port/in/CreateArticleUseCase.ts'
import { DeleteArticleUseCase } from '@/core/article/application/port/in/DeleteArticleUseCase.ts'
import { FindAllArticlesUseCase } from '@/core/article/application/port/in/FindAllArticlesUseCase.ts'
import { GetArticleByIdUseCase } from '@/core/article/application/port/in/GetArticleByIdUseCase.ts'
import { UpdateArticleUseCase } from '@/core/article/application/port/in/UpdateArticleUseCase.ts'
import { ArticleCommandPort } from '@/core/article/application/port/out/ArticleCommandPort.ts'
import { ArticleQueryPort } from '@/core/article/application/port/out/ArticleQueryPort.ts'
import { TokenService } from '@/core/auth/application/TokenService.ts'
import { GenerateTokenUseCase } from '@/core/auth/application/port/in/GenerateTokenUseCase.ts'
import { TransactionTemplate } from '@/core/common/domain/TransactionTemplate.ts'
import { env } from '@/core/config/env.ts'
import { UserMockAdapter } from '@/core/user/adapter/out/UserMockAdapter.ts'
import { UserPersistenceAdapter } from '@/core/user/adapter/out/UserPersistenceAdapter.ts'
import { UserCommandService } from '@/core/user/application/UserCommandService.ts'
import { UserQueryService } from '@/core/user/application/UserQueryService.ts'
import { LoginUseCase } from '@/core/user/application/port/in/LoginUseCase.ts'
import { RefreshTokenUseCase } from '@/core/user/application/port/in/RefreshTokenUseCase.ts'
import { SignUpUseCase } from '@/core/user/application/port/in/SignUpUseCase.ts'
import { UserCommandPort } from '@/core/user/application/port/out/UserCommandPort.ts'
import { UserQueryPort } from '@/core/user/application/port/out/UserQueryPort.ts'
import { DbClientSelector, selectDbClient } from '@/lib/db/drizzle.ts'
import { BeanConfig } from 'inversify-typesafe-spring-like'

export type Beans = {
  DbClientSelector: DbClientSelector,
  TransactionTemplate: TransactionTemplate,

  ArticleCommandPort: ArticleCommandPort,
  ArticleQueryPort: ArticleQueryPort,

  CreateArticleUseCase: CreateArticleUseCase,
  UpdateArticleUseCase: UpdateArticleUseCase,
  DeleteArticleUseCase: DeleteArticleUseCase,

  GetArticleByIdUseCase: GetArticleByIdUseCase,
  FindAllArticlesUseCase: FindAllArticlesUseCase,

  UserCommandPort: UserCommandPort,
  UserQueryPort: UserQueryPort,

  SignUpUseCase: SignUpUseCase,
  LoginUseCase: LoginUseCase,
  RefreshTokenUseCase: RefreshTokenUseCase,

  GenerateTokenUseCase: GenerateTokenUseCase,
}

export const beanConfig: BeanConfig<Beans> = {
  DbClientSelector: (bind) => bind().toConstantValue(selectDbClient),
  TransactionTemplate: (bind) => bind().to(TransactionTemplate),

  ArticleCommandPort: (bind) => {
    const adapter = env.USE_MOCK_ADAPTER ? ArticleMockAdapter : ArticlePersistenceAdapter;

    return bind().to(adapter)
  },
  ArticleQueryPort: (bind) => bind().toResolvedValue(it => it as ArticleQueryPort, ['ArticleCommandPort']),

  CreateArticleUseCase: (bind) => bind().to(ArticleCommandService),
  UpdateArticleUseCase: (bind) => bind().toResolvedValue(it => it as ArticleCommandService, ['CreateArticleUseCase']),
  DeleteArticleUseCase: (bind) => bind().toResolvedValue(it => it as ArticleCommandService, ['CreateArticleUseCase']),

  GetArticleByIdUseCase: (bind) => bind().to(ArticleQueryService),
  FindAllArticlesUseCase: (bind) => bind().toResolvedValue(it => it as ArticleQueryService, ['GetArticleByIdUseCase']),

  UserCommandPort: (bind) => {
    const adapter = env.USE_MOCK_ADAPTER ? UserMockAdapter : UserPersistenceAdapter;

    return bind().to(adapter)
  },
  UserQueryPort: (bind) => bind().toResolvedValue(it => it as UserQueryPort, ['UserCommandPort']),

  SignUpUseCase: (bind) => bind().to(UserCommandService),
  LoginUseCase: (bind) => bind().to(UserQueryService),
  RefreshTokenUseCase: (bind) => bind().toResolvedValue(it => it as RefreshTokenUseCase, ['LoginUseCase']),

  GenerateTokenUseCase: (bind) => bind().to(TokenService),
}