import { Article } from '@/core/article/domain/Article.js';
import { SqlOptions } from '@/core/common/domain/SqlOptions.js';

export interface ArticleQueryPort {
  findAll(sqlOptions: SqlOptions): Promise<Article[]>;
  getById(id: Article['id'], sqlOptions: SqlOptions): Promise<Article>;
}