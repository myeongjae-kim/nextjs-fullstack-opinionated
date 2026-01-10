import { articleCreationSchema, articleListSchema, articleSchema, articleUpdateSchema } from "@/core/article/domain/Article";
import { creationResponseSchema } from "@/core/common/domain/CreationResponse";
import { DomainNotFoundError } from "@/core/common/domain/DomainNotFoundError";
import { applicationContext } from "@/core/config/applicationContext";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

export const ArticleController = new Hono().get('/articles', async () => {
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
      throw new DomainNotFoundError(c.req.param("id"), "Article")
    }
    const article = await applicationContext().get("GetArticleByIdUseCase").get(id);

    return Response.json(articleSchema.parse(article));
  })
  .put("/articles/:id",
    zValidator("json", articleUpdateSchema),
    async (c) => {
      const id = Number(c.req.param("id"));

      if (isNaN(id)) {
        throw new DomainNotFoundError(c.req.param("id"), "Article")
      }

      await applicationContext().get("UpdateArticleUseCase").update(id, c.req.valid("json"));
      return new Response(null);
    })
  .delete("/articles/:id", async (c) => {
    const id = Number(c.req.param("id"));

    if (isNaN(id)) {
      throw new DomainNotFoundError(c.req.param("id"), "Article")
    }

    await applicationContext().get("DeleteArticleUseCase").delete(id);

    return new Response(null);
  })

export type AppType = typeof ArticleController;
export default ArticleController;