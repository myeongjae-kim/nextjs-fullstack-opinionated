import { handle } from 'hono/vercel';
import CreateArticleController from './articles/CreateArticleController';
import DeleteArticleController from './articles/DeleteArticleController';
import FindAllArticlesController from './articles/FindAllArticlesController';
import GetArticleByIdController from './articles/GetArticleByIdController';
import UpdateArticleController from './articles/UpdateArticleController';
import { serverApp } from './serverApp';

// Controller가 자신의 full-path를 관리한다. 여기서는 일괄적으로 "/"에 등록한다.
[
  CreateArticleController,
  DeleteArticleController,
  FindAllArticlesController,
  GetArticleByIdController,
  UpdateArticleController
].forEach(controller => serverApp.route("/", controller))

export const GET = handle(serverApp)
export const POST = handle(serverApp)
export const PUT = handle(serverApp)
export const PATCH = handle(serverApp)
export const DELETE = handle(serverApp)