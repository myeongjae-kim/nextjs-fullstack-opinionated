import { Article } from '@/core/article/domain/Article.js';

export interface GetArticleByIdUseCase {
  get(id: Article['id']): Promise<Article>;
}