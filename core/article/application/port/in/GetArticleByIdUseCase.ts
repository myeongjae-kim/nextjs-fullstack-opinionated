import { Article } from '@/core/article/domain/Article';

export interface GetArticleByIdUseCase {
  get(id: Article['id']): Promise<Article>;
}