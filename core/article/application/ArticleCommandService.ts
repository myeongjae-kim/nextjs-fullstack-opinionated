import { Autowired } from "@/core/config/Autowired";
import { Article, ArticleCreation, ArticleUpdate } from "../domain/Article";
import { CreateArticleUseCase } from "./port/in/CreateArticleUseCase";
import { DeleteArticleUseCase } from "./port/in/DeleteArticleUseCase";
import { UpdateArticleUseCase } from "./port/in/UpdateArticleUseCase";
import type { ArticleCommandPort } from "./port/out/ArticleCommandPort";

export class ArticleCommandService implements CreateArticleUseCase, UpdateArticleUseCase, DeleteArticleUseCase {
  constructor(
    @Autowired("ArticleCommandPort")
    private readonly articleCommandPort: ArticleCommandPort
  ) { }

  create(article: ArticleCreation): Promise<Pick<Article, "id">> {
    return this.articleCommandPort.createArticle(article);
  }

  update(id: Article["id"], article: ArticleUpdate): Promise<void> {
    return this.articleCommandPort.updateArticle(id, article);
  }

  delete(id: Article["id"]): Promise<void> {
    return this.articleCommandPort.deleteArticle(id);
  }
}