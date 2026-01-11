import { Article } from "@/core/article/domain/Article";
import { QueryOptions } from "@/core/common/domain/QueryOptions";

export interface ArticleQueryPort {
  findAll(queryOptions: QueryOptions): Promise<Article[]>;
  getById(id: Article["id"], queryOptions: QueryOptions): Promise<Article>;
}