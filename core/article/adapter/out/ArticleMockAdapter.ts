import { ArticleCommandPort } from '@/core/article/application/port/out/ArticleCommandPort.js';
import { ArticleQueryPort } from '@/core/article/application/port/out/ArticleQueryPort.js';
import { Article, ArticleCreation, ArticleUpdate } from '@/core/article/domain/Article.js';
import { SqlOptions } from '@/core/common/domain/SqlOptions.js';

export class ArticleMockAdapter implements ArticleCommandPort, ArticleQueryPort {
  async findAll(_sqlOptions: SqlOptions): Promise<Article[]> {
    return Promise.resolve([1, 2, 3].map((id) => ({
      id,
      title: `Article ${id}`,
      content: `Content of article ${id}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    })))
  }
  async getById(id: Article['id'], _sqlOptions: SqlOptions): Promise<Article> {
    return Promise.resolve({
      id,
      title: `Article ${id}`,
      content: `Content of article ${id}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  async createArticle(_article: ArticleCreation): Promise<Pick<Article, 'id'>> {
    return Promise.resolve({
      id: 1,
    });
  }
  async updateArticle(_id: Article['id'], _article: ArticleUpdate): Promise<void> {
    return Promise.resolve();
  }
  async deleteArticle(_id: Article['id']): Promise<void> {
    return Promise.resolve();
  }

}
