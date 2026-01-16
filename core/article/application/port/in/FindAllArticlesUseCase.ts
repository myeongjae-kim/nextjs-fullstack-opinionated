import { Article } from '@/core/article/domain/Article.js';

export interface FindAllArticlesUseCase {
  findAll(): Promise<Article[]>;
}