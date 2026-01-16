import { Article, ArticleCreation } from '@/core/article/domain/Article';

export interface CreateArticleUseCase {
  create(article: ArticleCreation): Promise<Pick<Article, 'id'>>;
}