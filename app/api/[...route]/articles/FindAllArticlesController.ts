import { articleListSchema } from "@/core/article/domain/Article";
import { applicationContext } from "@/core/config/applicationContext";
import { OpenAPIHono } from "@hono/zod-openapi";

export default new OpenAPIHono().get('/articles', async () => {
  const articles = await applicationContext().get("FindAllArticlesUseCase").findAll();

  return Response.json(articleListSchema.parse({
    content: articles
  }));
})