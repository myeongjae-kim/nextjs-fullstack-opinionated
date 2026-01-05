import { ArticleCommandPort } from "../../application/port/out/ArticleCommandPort";
import { ArticleQueryPort } from "../../application/port/out/ArticleQueryPort";
import { Article, ArticleCreation, ArticleUpdate } from "../../domain/Article";

export class ArticleAdapter implements ArticleCommandPort, ArticleQueryPort {
  async findAll(): Promise<Article[]> {
    return [1, 2, 3].map((id) => ({
      id,
      title: `Article ${id}`,
      content: `Content of article ${id}`,
    }))
  }
  async getById(id: Article["id"]): Promise<Article> {
    return {
      id,
      title: `Article ${id}`,
      content: `Content of article ${id}`,
    }
  }
  async createArticle(article: ArticleCreation): Promise<Pick<Article, "id">> {
    return {
      id: 1,
    }
  }
  async updateArticle(id: Article["id"], article: ArticleUpdate): Promise<void> {
    return;
  }
  async deleteArticle(id: Article["id"]): Promise<void> {
    return;
  }

}