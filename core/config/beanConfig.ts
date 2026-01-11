import { DbClientSelector, selectDbClient } from "@/lib/db/drizzle"
import { BeanConfig } from "inversify-typesafe-spring-like"
import { ArticleInMemoryAdapter } from "../article/adapter/out/ArticleInMemoryAdapter"
import { ArticleCommandService } from "../article/application/ArticleCommandService"
import { ArticleQueryService } from "../article/application/ArticleQueryService"
import { CreateArticleUseCase } from "../article/application/port/in/CreateArticleUseCase"
import { DeleteArticleUseCase } from "../article/application/port/in/DeleteArticleUseCase"
import { FindAllArticlesUseCase } from "../article/application/port/in/FindAllArticlesUseCase"
import { GetArticleByIdUseCase } from "../article/application/port/in/GetArticleByIdUseCase"
import { UpdateArticleUseCase } from "../article/application/port/in/UpdateArticleUseCase"
import { ArticleCommandPort } from "../article/application/port/out/ArticleCommandPort"
import { ArticleQueryPort } from "../article/application/port/out/ArticleQueryPort"

export type Beans = {
  DbClientSelector: DbClientSelector,

  ArticleCommandPort: ArticleCommandPort,
  ArticleQueryPort: ArticleQueryPort,

  CreateArticleUseCase: CreateArticleUseCase,
  UpdateArticleUseCase: UpdateArticleUseCase,
  DeleteArticleUseCase: DeleteArticleUseCase,

  GetArticleByIdUseCase: GetArticleByIdUseCase,
  FindAllArticlesUseCase: FindAllArticlesUseCase,
}

export const beanConfig: BeanConfig<Beans> = {
  DbClientSelector: (bind) => bind().toConstantValue(selectDbClient),

  ArticleCommandPort: (bind) => bind().to(ArticleInMemoryAdapter),
  ArticleQueryPort: (bind) => bind().toResolvedValue(it => it as ArticleQueryPort, ["ArticleCommandPort"]),

  CreateArticleUseCase: (bind) => bind().to(ArticleCommandService),
  UpdateArticleUseCase: (bind) => bind().toResolvedValue(it => it as ArticleCommandService, ["CreateArticleUseCase"]),
  DeleteArticleUseCase: (bind) => bind().toResolvedValue(it => it as ArticleCommandService, ["CreateArticleUseCase"]),

  GetArticleByIdUseCase: (bind) => bind().to(ArticleQueryService),
  FindAllArticlesUseCase: (bind) => bind().toResolvedValue(it => it as ArticleQueryService, ["GetArticleByIdUseCase"]),
}