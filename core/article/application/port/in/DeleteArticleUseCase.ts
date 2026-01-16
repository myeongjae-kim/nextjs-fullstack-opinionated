import { Article } from '@/core/article/domain/Article.js';

export interface DeleteArticleUseCase {
  delete(id: Article['id']): Promise<void>;
}