import { Article } from "@/core/article/domain/Article";
import { SqlOptions } from "@/core/common/domain/SqlOptions";

export interface ArticleQueryPort {
  findAll(queryOptions: SqlOptions): Promise<Article[]>;
  getById(id: Article["id"], queryOptions: SqlOptions): Promise<Article>;
}