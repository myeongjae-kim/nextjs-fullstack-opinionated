import { CreateArticleUseCase } from '@/core/article/application/port/in/CreateArticleUseCase';
import { DeleteArticleUseCase } from '@/core/article/application/port/in/DeleteArticleUseCase';
import { UpdateArticleUseCase } from '@/core/article/application/port/in/UpdateArticleUseCase';
import type { ArticleCommandPort } from '@/core/article/application/port/out/ArticleCommandPort';
import { Article, ArticleCreation, ArticleUpdate } from '@/core/article/domain/Article';
import { Autowired } from '@/core/config/Autowired';

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