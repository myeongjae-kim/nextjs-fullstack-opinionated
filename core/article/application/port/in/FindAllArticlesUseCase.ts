import { Article } from '@/core/article/domain/Article';

export interface FindAllArticlesUseCase {
  findAll(): Promise<Article[]>;
}