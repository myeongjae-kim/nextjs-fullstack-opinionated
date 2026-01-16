import { FindAllArticlesUseCase } from '@/core/article/application/port/in/FindAllArticlesUseCase.ts';
import { GetArticleByIdUseCase } from '@/core/article/application/port/in/GetArticleByIdUseCase.ts';
import type { ArticleQueryPort } from '@/core/article/application/port/out/ArticleQueryPort.ts';
import { Article } from '@/core/article/domain/Article.ts';
import { DomainNotFoundError } from '@/core/common/domain/DomainNotFoundError.ts';
import { Autowired } from '@/core/config/Autowired.ts';

export class ArticleQueryService implements GetArticleByIdUseCase, FindAllArticlesUseCase {
  constructor(
    @Autowired('ArticleQueryPort')
    private readonly articleQueryPort: ArticleQueryPort
  ) { }

  findAll(): Promise<Article[]> {
    return this.articleQueryPort.findAll({ useReplica: true });
  }

  get(id: Article['id']): Promise<Article> {
    if (id === 999) {
      throw new DomainNotFoundError(id, 'Article')
    }

    return this.articleQueryPort.getById(id, { useReplica: true });
  }
}