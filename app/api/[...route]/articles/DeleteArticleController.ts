import { DomainNotFoundError } from "@/core/common/domain/DomainNotFoundError";
import { applicationContext } from "@/core/config/applicationContext";
import { OpenAPIHono } from "@hono/zod-openapi";

export default new OpenAPIHono().delete("/articles/:id", async (c) => {
  const id = Number(c.req.param("id"));

  if (isNaN(id)) {
    throw new DomainNotFoundError(c.req.param("id"), "Article")
  }

  await applicationContext().get("DeleteArticleUseCase").delete(id);

  return new Response(null);
})