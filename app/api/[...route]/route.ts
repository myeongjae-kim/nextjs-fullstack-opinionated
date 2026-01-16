import CreateArticleController from '@/app/api/[...route]/articles/CreateArticleController';
import DeleteArticleController from '@/app/api/[...route]/articles/DeleteArticleController';
import FindAllArticlesController from '@/app/api/[...route]/articles/FindAllArticlesController';
import GetArticleByIdController from '@/app/api/[...route]/articles/GetArticleByIdController';
import UpdateArticleController from '@/app/api/[...route]/articles/UpdateArticleController';
import { serverApp } from '@/app/api/[...route]/serverApp';
import LoginController from '@/app/api/[...route]/users/login/LoginController';
import GetCurrentUserController from '@/app/api/[...route]/users/me/GetCurrentUserController';
import RefreshTokenController from '@/app/api/[...route]/users/refresh/RefreshTokenController';
import SignUpController from '@/app/api/[...route]/users/signup/SignUpController';
import { handle } from 'hono/vercel';

// Controller가 자신의 full-path를 관리한다. 여기서는 일괄적으로 "/"에 등록한다.
// 한 개의 메소드만 갖는 계층형 컨트롤러/서비스 패키지 스타일: https://johngrib.github.io/wiki/article/hierarchical-controller-package-structure/
[
  CreateArticleController,
  DeleteArticleController,
  FindAllArticlesController,
  GetArticleByIdController,
  UpdateArticleController,
  SignUpController,
  LoginController,
  RefreshTokenController,
  GetCurrentUserController,
].forEach(controller => serverApp.route('/', controller))

export const GET = handle(serverApp)
export const POST = handle(serverApp)
export const PUT = handle(serverApp)
export const PATCH = handle(serverApp)
export const DELETE = handle(serverApp)