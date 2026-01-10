import { articleSchema } from "@/core/article/domain/Article";
import { DomainNotFoundError } from "@/core/common/domain/DomainNotFoundError";
import { applicationContext } from "@/core/config/applicationContext";
import { OpenAPIHono } from "@hono/zod-openapi";

export default new OpenAPIHono().get("/articles/:id", async (c) => {
  const id = Number(c.req.param("id"));

  if (isNaN(id)) {
    throw new DomainNotFoundError(c.req.param("id"), "Article")
  }
  const article = await applicationContext().get("GetArticleByIdUseCase").get(id);

  return Response.json(articleSchema.parse(article));
})