import { ArticleCommandPort } from "../../application/port/out/ArticleCommandPort";
import { ArticleQueryPort } from "../../application/port/out/ArticleQueryPort";
import { QueryOptions } from "../../../common/domain/QueryOptions";
import { Article, ArticleCreation, ArticleUpdate } from "../../domain/Article";

export class ArticleInMemoryAdapter implements ArticleCommandPort, ArticleQueryPort {
  async findAll(_queryOptions: QueryOptions): Promise<Article[]> {
    return Promise.resolve([1, 2, 3].map((id) => ({
      id,
      title: `Article ${id}`,
      content: `Content of article ${id}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    })))
  }
  async getById(id: Article["id"], _queryOptions: QueryOptions): Promise<Article> {
    return Promise.resolve({
      id,
      title: `Article ${id}`,
      content: `Content of article ${id}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  async createArticle(_article: ArticleCreation): Promise<Pick<Article, "id">> {
    return Promise.resolve({
      id: 1,
    });
  }
  async updateArticle(_id: Article["id"], _article: ArticleUpdate): Promise<void> {
    return Promise.resolve();
  }
  async deleteArticle(_id: Article["id"]): Promise<void> {
    return Promise.resolve();
  }

}