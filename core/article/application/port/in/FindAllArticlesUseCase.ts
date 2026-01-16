import { Article } from '@/core/article/domain/Article.ts';

export interface FindAllArticlesUseCase {
  findAll(): Promise<Article[]>;
}