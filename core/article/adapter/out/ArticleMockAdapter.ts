import { ArticleCommandPort } from '@/core/article/application/port/out/ArticleCommandPort.ts';
import { ArticleQueryPort } from '@/core/article/application/port/out/ArticleQueryPort.ts';
import { Article, ArticleCreation, ArticleUpdate } from '@/core/article/domain/Article.ts';
import { SqlOptions } from '@/core/common/domain/SqlOptions.ts';

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
