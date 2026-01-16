import { ArticleCommandPort } from '@/core/article/application/port/out/ArticleCommandPort';
import { ArticleQueryPort } from '@/core/article/application/port/out/ArticleQueryPort';
import { Article, ArticleCreation, ArticleUpdate } from '@/core/article/domain/Article';
import { DomainNotFoundError } from '@/core/common/domain/DomainNotFoundError';
import { SqlOptions } from '@/core/common/domain/SqlOptions';
import { TransactionTemplate } from '@/core/common/domain/TransactionTemplate';
import { withDatabaseErrorHandling } from '@/core/common/util/withDatabaseErrorHandling';
import { Autowired } from '@/core/config/Autowired';
import { article } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export class ArticlePersistenceAdapter implements ArticleCommandPort, ArticleQueryPort {
  constructor(
    @Autowired('TransactionTemplate')
    private readonly transactionTemplate: TransactionTemplate
  ) {
    // 생성자에서 자기 자신을 Proxy로 래핑하여 반환
    return withDatabaseErrorHandling(this);
  }

  async findAll(sqlOptions: SqlOptions): Promise<Article[]> {
    return this.transactionTemplate.execute(sqlOptions, async (tx) => {
      const results = await tx.select().from(article);

      return results.map(row => {
        return ({
          id: row.id,
          title: row.title,
          content: row.content,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        });
      });
    });
  }

  async getById(id: Article['id'], sqlOptions: SqlOptions): Promise<Article> {
    return this.transactionTemplate.execute(sqlOptions, async (tx) => {
      const results = await tx.select().from(article).where(eq(article.id, id)).limit(1);

      const row = results[0];
      if (!row) {
        throw new DomainNotFoundError(id, 'Article');
      }

      return {
        id: row.id,
        title: row.title,
        content: row.content,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };
    });
  }

  async createArticle(articleData: ArticleCreation): Promise<Pick<Article, 'id'>> {
    return this.transactionTemplate.execute({ useReplica: false }, async (tx) => {
      const result = await tx.insert(article).values({
        title: articleData.title,
        content: articleData.content,
      });

      return {
        id: Number(result[0].insertId),
      };
    });
  }

  async updateArticle(id: Article['id'], articleData: ArticleUpdate): Promise<void> {
    return this.transactionTemplate.execute({ useReplica: false }, async (tx) => {
      await tx.update(article)
        .set({
          ...(articleData.title !== undefined && { title: articleData.title }),
          ...(articleData.content !== undefined && { content: articleData.content }),
          updatedAt: new Date(),
        })
        .where(eq(article.id, id));
    });
  }

  async deleteArticle(id: Article['id']): Promise<void> {
    return this.transactionTemplate.execute({ useReplica: false }, async (tx) => {
      await tx.delete(article).where(eq(article.id, id));
    });
  }
}