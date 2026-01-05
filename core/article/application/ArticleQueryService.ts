import { DomainNotFoundError } from "@/core/common/domain/DomainNotFoundError";
import { Autowired } from "@/core/config/Autowired";
import { Article } from "../domain/Article";
import { FindAllArticlesUseCase } from "./port/in/FindAllArticlesUseCase";
import { GetArticleByIdUseCase } from "./port/in/GetArticleByIdUseCase";
import type { ArticleQueryPort } from "./port/out/ArticleQueryPort";

export class ArticleQueryService implements GetArticleByIdUseCase, FindAllArticlesUseCase {
  constructor(
    @Autowired("ArticleQueryPort")
    private readonly articleQueryPort: ArticleQueryPort
  ) { }

  findAll(): Promise<Article[]> {
    return this.articleQueryPort.findAll();
  }

  get(id: Article["id"]): Promise<Article> {
    if (id === 999) {
      throw new DomainNotFoundError(id, "Article")
    }

    return this.articleQueryPort.getById(id);
  }
}