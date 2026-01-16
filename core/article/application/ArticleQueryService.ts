import { FindAllArticlesUseCase } from '@/core/article/application/port/in/FindAllArticlesUseCase';
import { GetArticleByIdUseCase } from '@/core/article/application/port/in/GetArticleByIdUseCase';
import type { ArticleQueryPort } from '@/core/article/application/port/out/ArticleQueryPort';
import { Article } from '@/core/article/domain/Article';
import { DomainNotFoundError } from '@/core/common/domain/DomainNotFoundError';
import { Autowired } from '@/core/config/Autowired';

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