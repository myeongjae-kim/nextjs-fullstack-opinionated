import { Article } from "@/core/article/domain/Article";

export interface DeleteArticleUseCase {
  delete(id: Article["id"]): Promise<void>;
}