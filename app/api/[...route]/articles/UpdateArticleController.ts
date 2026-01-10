import { articleUpdateSchema } from "@/core/article/domain/Article";
import { DomainNotFoundError } from "@/core/common/domain/DomainNotFoundError";
import { applicationContext } from "@/core/config/applicationContext";
import { OpenAPIHono } from "@hono/zod-openapi";
import { zValidator } from "@hono/zod-validator";

export default new OpenAPIHono().put("/articles/:id",
  zValidator("json", articleUpdateSchema),
  async (c) => {
    const id = Number(c.req.param("id"));

    if (isNaN(id)) {
      throw new DomainNotFoundError(c.req.param("id"), "Article")
    }

    await applicationContext().get("UpdateArticleUseCase").update(id, c.req.valid("json"));
    return new Response(null);
  })