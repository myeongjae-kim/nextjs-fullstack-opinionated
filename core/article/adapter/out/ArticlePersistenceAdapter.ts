import { ArticleCommandPort } from "@/core/article/application/port/out/ArticleCommandPort";
import { ArticleQueryPort } from "@/core/article/application/port/out/ArticleQueryPort";
import { Article, ArticleCreation, ArticleUpdate } from "@/core/article/domain/Article";
import { DomainNotFoundError } from "@/core/common/domain/DomainNotFoundError";
import { QueryOptions } from "@/core/common/domain/QueryOptions";
import { withDatabaseErrorHandling } from "@/core/common/util/withDatabaseErrorHandling";
import { Autowired } from "@/core/config/Autowired";
import type { DbClientSelector } from "@/lib/db/drizzle";
import { article } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export class ArticlePersistenceAdapter implements ArticleCommandPort, ArticleQueryPort {
  constructor(
    @Autowired("DbClientSelector")
    private readonly dbClientSelector: DbClientSelector
  ) {
    // 생성자에서 자기 자신을 Proxy로 래핑하여 반환
    return withDatabaseErrorHandling(this);
  }

  async findAll(queryOptions: QueryOptions): Promise<Article[]> {
    const db = this.dbClientSelector({ useReplica: queryOptions.useReplica });
    const results = await db.select().from(article);

    return results.map(row => {
      return ({
        id: row.id,
        title: row.title,
        content: row.content,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      });
    });
  }

  async getById(id: Article["id"], queryOptions: QueryOptions): Promise<Article> {
    const db = this.dbClientSelector({ useReplica: queryOptions.useReplica });
    const results = await db.select().from(article).where(eq(article.id, id)).limit(1);

    if (results.length === 0) {
      throw new DomainNotFoundError(id, "Article");
    }

    const row = results[0];
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async createArticle(articleData: ArticleCreation): Promise<Pick<Article, "id">> {
    const db = this.dbClientSelector();
    const result = await db.insert(article).values({
      title: articleData.title,
      content: articleData.content,
    });

    return {
      id: Number(result[0].insertId),
    };
  }

  async updateArticle(id: Article["id"], articleData: ArticleUpdate): Promise<void> {
    const db = this.dbClientSelector();
    await db.update(article)
      .set({
        ...(articleData.title !== undefined && { title: articleData.title }),
        ...(articleData.content !== undefined && { content: articleData.content }),
        updatedAt: new Date(),
      })
      .where(eq(article.id, id));
  }

  async deleteArticle(id: Article["id"]): Promise<void> {
    const db = this.dbClientSelector();
    await db.delete(article).where(eq(article.id, id));
  }
}