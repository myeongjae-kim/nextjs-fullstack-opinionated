import { articleCreationSchema } from "@/core/article/domain/Article";
import { creationResponseSchema } from "@/core/common/domain/CreationResponse";
import { applicationContext } from "@/core/config/applicationContext";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";

const route = createRoute({
  method: 'post',
  path: '/articles',
  security: [{
    bearerAuth: [],
  }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: articleCreationSchema,
        },
      },
      description: "The article creation schema",
      required: true,
    }
  },
  responses: {
    200: {
      description: "The article creation response schema",
    },
  },
})

export default new OpenAPIHono().openapi(route,
  async (c) => {
    const article = await applicationContext().get("CreateArticleUseCase").create(c.req.valid("json"));

    return Response.json(creationResponseSchema.parse(article));
  });