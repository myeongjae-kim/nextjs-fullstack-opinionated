import defineRoute from "@/app/util/@omer-x/next-openapi-route-handler";
import { articleCreationSchema, articleListSchema } from "@/core/article/domain/Article";
import { apiErrorSchema } from "@/core/common/domain/ApiError";
import { creationResponseSchema } from "@/core/common/domain/CreationResponse";
import { applicationContext } from "@/core/config/applicationContext";

export const { GET } = defineRoute({
  operationId: "findArticles",
  method: 'GET',
  summary: "Find Articles",
  description: "Find Articles",
  tags: ["Articles"],
  action: async () => {
    const articles = await applicationContext().get("FindAllArticlesUseCase").findAll();

    return Response.json(articleListSchema.parse({
      content: articles
    }));
  },
  responses: {
    200: { description: "Article Fetched", content: articleListSchema }
  },
});

export const { POST } = defineRoute({
  operationId: "createArticle",
  method: 'POST',
  summary: "Create an Article",
  description: "Create an Article",
  tags: ["Articles"],
  security: [{ bearerAuth: [] }], // required bearer auth
  requestBody: articleCreationSchema,
  action: async ({ body }) => {
    const article = await applicationContext().get("CreateArticleUseCase").create(body);

    return Response.json(creationResponseSchema.parse(article));
  },
  responses: {
    200: { description: "Article Created", content: creationResponseSchema },
    401: { description: "Unauthorized", content: apiErrorSchema },
  },
})