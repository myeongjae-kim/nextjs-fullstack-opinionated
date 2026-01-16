import { Article, ArticleCreation, ArticleUpdate } from '@/core/article/domain/Article';

export interface ArticleCommandPort {
  createArticle(article: ArticleCreation): Promise<Pick<Article, 'id'>>;
  updateArticle(id: Article['id'], article: ArticleUpdate): Promise<void>;
  deleteArticle(id: Article['id']): Promise<void>;
}