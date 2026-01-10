import { articleUpdateSchema } from "@/core/article/domain/Article";
import { DomainNotFoundError } from "@/core/common/domain/DomainNotFoundError";
import { applicationContext } from "@/core/config/applicationContext";
import { createRoute, z } from "@hono/zod-openapi";
import { Controller } from "../config/Controller";

const route = createRoute({
  method: 'put',
  path: '/articles/{id}',
  security: [{
    bearerAuth: [],
  }],
  tags: ['articles'],
  request: {
    params: z.object({
      id: z.string().openapi({
        param: {
          name: 'id',
          in: 'path',
        },
        description: 'The article id',
      }),
    }),
    body: {
      content: {
        'application/json': {
          schema: articleUpdateSchema,
        },
      },
      description: "The article update schema",
      required: true,
    },
  },
  responses: {
    204: {
      description: "Article updated successfully",
    },
  },
})

export default Controller().openapi(route, async (c) => {
  const id = Number(c.req.valid("param").id);

  if (isNaN(id)) {
    throw new DomainNotFoundError(c.req.valid("param").id, "Article")
  }

  // authMiddleware에서 설정한 principal을 아래처럼 접근할 수 있다.
  const _principal = c.get("principal");

  await applicationContext().get("UpdateArticleUseCase").update(id, c.req.valid("json"));
  return new Response(null, { status: 204 });
})