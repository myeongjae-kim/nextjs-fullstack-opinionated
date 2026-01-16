import { Article, ArticleUpdate } from '@/core/article/domain/Article.js';

export interface UpdateArticleUseCase {
  update(id: Article['id'], article: ArticleUpdate): Promise<void>;
}