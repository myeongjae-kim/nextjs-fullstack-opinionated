import { Article, ArticleUpdate } from '@/core/article/domain/Article';

export interface UpdateArticleUseCase {
  update(id: Article['id'], article: ArticleUpdate): Promise<void>;
}