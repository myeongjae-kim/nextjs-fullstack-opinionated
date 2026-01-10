import { articleCreationSchema, articleListSchema, articleSchema, articleUpdateSchema } from '@/core/article/domain/Article';
import { ApiError } from '@/core/common/domain/ApiError';
import { creationResponseSchema } from '@/core/common/domain/CreationResponse';
import { DomainNotFoundError } from '@/core/common/domain/DomainNotFoundError';
import { applicationContext } from '@/core/config/applicationContext';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import z from 'zod';

const app = new Hono().basePath('/api').onError((e) => {
  const defaultServerErrorStatus = 500;

  if (e instanceof DomainNotFoundError) {
    return Response.json(new ApiError({
      status: 404,
      error: "DOMAIN_NOT_FOUND_ERROR",
      code: "CODE_002",
      message: e.message,
    }), { status: 404 });
  }

  if (e instanceof z.ZodError) {
    return Response.json(new ApiError({
      status: defaultServerErrorStatus,
      error: "VALIDATION_ERROR_IN_ACTION",
      code: "CODE_001",
      message: e.issues?.[0]?.message,
    }), { status: defaultServerErrorStatus });
  }

  return Response.json(new ApiError({
    status: defaultServerErrorStatus,
    error: "INTERNAL_SERVER_ERROR",
    code: "NONE",
    message: (e as Error).message,
  }), { status: defaultServerErrorStatus });
});

app.get('/articles', async () => {
  const articles = await applicationContext().get("FindAllArticlesUseCase").findAll();

  return Response.json(articleListSchema.parse({
    content: articles
  }));
}).post("/articles",
  zValidator("json", articleCreationSchema),
  async (c) => {
    const article = await applicationContext().get("CreateArticleUseCase").create(c.req.valid("json"));

    return Response.json(creationResponseSchema.parse(article));
  })
  .get("/articles/:id", async (c) => {
    const id = Number(c.req.param("id"));

    if (isNaN(id)) {
      throw new DomainNotFoundError(id, "Article")
    }
    const article = await applicationContext().get("GetArticleByIdUseCase").get(id);

    return Response.json(articleSchema.parse(article));
  })
  .put("/articles/:id",
    zValidator("json", articleUpdateSchema),
    async (c) => {
      const id = Number(c.req.param("id"));

      if (isNaN(id)) {
        throw new DomainNotFoundError(id, "Article")
      }

      await applicationContext().get("UpdateArticleUseCase").update(id, c.req.valid("json"));
      return new Response(null);
    })
  .delete("/articles/:id", async (c) => {
    const id = Number(c.req.param("id"));

    if (isNaN(id)) {
      throw new DomainNotFoundError(id, "Article")
    }

    await applicationContext().get("DeleteArticleUseCase").delete(id);

    return new Response(null);
  })

export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const PATCH = handle(app)
export const DELETE = handle(app)
