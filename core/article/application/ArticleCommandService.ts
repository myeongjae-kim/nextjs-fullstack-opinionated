import { CreateArticleUseCase } from '@/core/article/application/port/in/CreateArticleUseCase.ts';
import { DeleteArticleUseCase } from '@/core/article/application/port/in/DeleteArticleUseCase.ts';
import { UpdateArticleUseCase } from '@/core/article/application/port/in/UpdateArticleUseCase.ts';
import type { ArticleCommandPort } from '@/core/article/application/port/out/ArticleCommandPort.ts';
import { Article, ArticleCreation, ArticleUpdate } from '@/core/article/domain/Article.ts';
import { Autowired } from '@/core/config/Autowired.ts';

export class ArticleCommandService implements CreateArticleUseCase, UpdateArticleUseCase, DeleteArticleUseCase {
  constructor(
    @Autowired('ArticleCommandPort')
    private readonly articleCommandPort: ArticleCommandPort
  ) { }

  create(article: ArticleCreation): Promise<Pick<Article, 'id'>> {
    return this.articleCommandPort.createArticle(article);
  }

  update(id: Article['id'], article: ArticleUpdate): Promise<void> {
    return this.articleCommandPort.updateArticle(id, article);
  }

  delete(id: Article['id']): Promise<void> {
    return this.articleCommandPort.deleteArticle(id);
  }
}