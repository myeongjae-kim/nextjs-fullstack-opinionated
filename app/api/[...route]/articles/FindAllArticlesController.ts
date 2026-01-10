import { articleListSchema } from "@/core/article/domain/Article";
import { applicationContext } from "@/core/config/applicationContext";
import { createRoute } from "@hono/zod-openapi";
import { Controller } from "../config/Controller";

const route = createRoute({
  method: 'get',
  path: '/articles',
  security: [{
    bearerAuth: [],
  }],
  tags: ['articles'],
  responses: {
    200: {
      description: "The article list response schema",
      content: {
        'application/json': {
          schema: articleListSchema,
        },
      },
    },
  },
})

export default Controller().openapi(route, async (c) => {
  const articles = await applicationContext().get("FindAllArticlesUseCase").findAll();

  return c.json(articleListSchema.parse({
    content: articles
  }));
})