import { handle } from 'hono/vercel';
import CreateArticleController from './articles/CreateArticleController';
import DeleteArticleController from './articles/DeleteArticleController';
import FindAllArticlesController from './articles/FindAllArticlesController';
import GetArticleByIdController from './articles/GetArticleByIdController';
import UpdateArticleController from './articles/UpdateArticleController';
import { serverApp } from './serverApp';

serverApp.route("/", CreateArticleController)
serverApp.route("/", DeleteArticleController)
serverApp.route("/", FindAllArticlesController)
serverApp.route("/", GetArticleByIdController)
serverApp.route("/", UpdateArticleController)

export const GET = handle(serverApp)
export const POST = handle(serverApp)
export const PUT = handle(serverApp)
export const PATCH = handle(serverApp)
export const DELETE = handle(serverApp)