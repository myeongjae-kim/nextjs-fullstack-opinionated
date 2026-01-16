import { Article } from '@/core/article/domain/Article.ts';

export interface DeleteArticleUseCase {
  delete(id: Article['id']): Promise<void>;
}