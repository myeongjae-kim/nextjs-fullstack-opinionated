import { FindAllArticlesUseCase } from '@/core/article/application/port/in/FindAllArticlesUseCase.js';
import { GetArticleByIdUseCase } from '@/core/article/application/port/in/GetArticleByIdUseCase.js';
import type { ArticleQueryPort } from '@/core/article/application/port/out/ArticleQueryPort.js';
import { Article } from '@/core/article/domain/Article.js';
import { DomainNotFoundError } from '@/core/common/domain/DomainNotFoundError.js';
import { Autowired } from '@/core/config/Autowired.js';

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