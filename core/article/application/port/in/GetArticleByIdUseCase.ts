import { Article } from '@/core/article/domain/Article.ts';

export interface GetArticleByIdUseCase {
  get(id: Article['id']): Promise<Article>;
}