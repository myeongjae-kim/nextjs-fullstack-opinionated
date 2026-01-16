import { ArticleMockAdapter } from '@/core/article/adapter/out/ArticleMockAdapter'
import { ArticlePersistenceAdapter } from '@/core/article/adapter/out/ArticlePersistenceAdapter'
import { ArticleCommandService } from '@/core/article/application/ArticleCommandService'
import { ArticleQueryService } from '@/core/article/application/ArticleQueryService'
import { CreateArticleUseCase } from '@/core/article/application/port/in/CreateArticleUseCase'
import { DeleteArticleUseCase } from '@/core/article/application/port/in/DeleteArticleUseCase'
import { FindAllArticlesUseCase } from '@/core/article/application/port/in/FindAllArticlesUseCase'
import { GetArticleByIdUseCase } from '@/core/article/application/port/in/GetArticleByIdUseCase'
import { UpdateArticleUseCase } from '@/core/article/application/port/in/UpdateArticleUseCase'
import { ArticleCommandPort } from '@/core/article/application/port/out/ArticleCommandPort'
import { ArticleQueryPort } from '@/core/article/application/port/out/ArticleQueryPort'
import { TokenService } from '@/core/auth/application/TokenService'
import { GenerateTokenUseCase } from '@/core/auth/application/port/in/GenerateTokenUseCase'
import { TransactionTemplate } from '@/core/common/domain/TransactionTemplate'
import { env } from '@/core/config/env'
import { UserMockAdapter } from '@/core/user/adapter/out/UserMockAdapter'
import { UserPersistenceAdapter } from '@/core/user/adapter/out/UserPersistenceAdapter'
import { UserCommandService } from '@/core/user/application/UserCommandService'
import { UserQueryService } from '@/core/user/application/UserQueryService'
import { LoginUseCase } from '@/core/user/application/port/in/LoginUseCase'
import { RefreshTokenUseCase } from '@/core/user/application/port/in/RefreshTokenUseCase'
import { SignUpUseCase } from '@/core/user/application/port/in/SignUpUseCase'
import { UserCommandPort } from '@/core/user/application/port/out/UserCommandPort'
import { UserQueryPort } from '@/core/user/application/port/out/UserQueryPort'
import { DbClientSelector, selectDbClient } from '@/lib/db/drizzle'
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