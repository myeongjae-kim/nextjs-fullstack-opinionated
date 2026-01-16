import { Article } from '@/core/article/domain/Article';
import { SqlOptions } from '@/core/common/domain/SqlOptions';

export interface ArticleQueryPort {
  findAll(sqlOptions: SqlOptions): Promise<Article[]>;
  getById(id: Article['id'], sqlOptions: SqlOptions): Promise<Article>;
}