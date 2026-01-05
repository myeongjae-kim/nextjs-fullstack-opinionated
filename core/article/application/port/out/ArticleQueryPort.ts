import { Article } from "@/core/article/domain/Article";

export interface ArticleQueryPort {
  findAll(): Promise<Article[]>;
  getById(id: Article["id"]): Promise<Article>;
}