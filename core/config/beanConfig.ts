import { DbClientSelector, selectDbClient } from "@/lib/db/drizzle"
import { BeanConfig } from "inversify-typesafe-spring-like"
import { ArticleInMemoryAdapter } from "../article/adapter/out/ArticleInMemoryAdapter"
import { ArticlePersistenceAdapter } from "../article/adapter/out/ArticlePersistenceAdapter"
import { ArticleCommandService } from "../article/application/ArticleCommandService"
import { ArticleQueryService } from "../article/application/ArticleQueryService"
import { CreateArticleUseCase } from "../article/application/port/in/CreateArticleUseCase"
import { DeleteArticleUseCase } from "../article/application/port/in/DeleteArticleUseCase"
import { FindAllArticlesUseCase } from "../article/application/port/in/FindAllArticlesUseCase"
import { GetArticleByIdUseCase } from "../article/application/port/in/GetArticleByIdUseCase"
import { UpdateArticleUseCase } from "../article/application/port/in/UpdateArticleUseCase"
import { ArticleCommandPort } from "../article/application/port/out/ArticleCommandPort"
import { ArticleQueryPort } from "../article/application/port/out/ArticleQueryPort"
import { UserInMemoryAdapter } from "../user/adapter/out/UserInMemoryAdapter"
import { UserPersistenceAdapter } from "../user/adapter/out/UserPersistenceAdapter"
import { UserCommandService } from "../user/application/UserCommandService"
import { UserQueryService } from "../user/application/UserQueryService"
import { LoginUseCase } from "../user/application/port/in/LoginUseCase"
import { RefreshTokenUseCase } from "../user/application/port/in/RefreshTokenUseCase"
import { SignUpUseCase } from "../user/application/port/in/SignUpUseCase"
import { UserCommandPort } from "../user/application/port/out/UserCommandPort"
import { UserQueryPort } from "../user/application/port/out/UserQueryPort"
import { env } from "./env"

export type Beans = {
  DbClientSelector: DbClientSelector,

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
}

export const beanConfig: BeanConfig<Beans> = {
  DbClientSelector: (bind) => bind().toConstantValue(selectDbClient),

  ArticleCommandPort: (bind) => {
    const adapter = env.USE_PERSISTENCE_ADAPTER ? ArticlePersistenceAdapter : ArticleInMemoryAdapter;

    return bind().to(adapter)
  },
  ArticleQueryPort: (bind) => bind().toResolvedValue(it => it as ArticleQueryPort, ["ArticleCommandPort"]),

  CreateArticleUseCase: (bind) => bind().to(ArticleCommandService),
  UpdateArticleUseCase: (bind) => bind().toResolvedValue(it => it as ArticleCommandService, ["CreateArticleUseCase"]),
  DeleteArticleUseCase: (bind) => bind().toResolvedValue(it => it as ArticleCommandService, ["CreateArticleUseCase"]),

  GetArticleByIdUseCase: (bind) => bind().to(ArticleQueryService),
  FindAllArticlesUseCase: (bind) => bind().toResolvedValue(it => it as ArticleQueryService, ["GetArticleByIdUseCase"]),

  UserCommandPort: (bind) => {
    const adapter = env.USE_PERSISTENCE_ADAPTER ? UserPersistenceAdapter : UserInMemoryAdapter;

    return bind().to(adapter)
  },
  UserQueryPort: (bind) => bind().toResolvedValue(it => it as UserQueryPort, ["UserCommandPort"]),

  SignUpUseCase: (bind) => bind().to(UserCommandService),
  LoginUseCase: (bind) => bind().to(UserQueryService),
  RefreshTokenUseCase: (bind) => bind().toResolvedValue(it => it as RefreshTokenUseCase, ["LoginUseCase"]),
}