import defineRoute from "@/app/util/@omer-x/next-openapi-route-handler";
import { articleSchema, articleUpdateSchema } from "@/core/article/domain/Article";
import { apiErrorSchema } from "@/core/common/domain/ApiError";
import { DomainNotFoundError } from "@/core/common/domain/DomainNotFoundError";
import { applicationContext } from "@/core/config/applicationContext";
import z from "zod";

export const { GET } = defineRoute({
  operationId: "getArticleById",
  method: 'GET',
  summary: "Get an Article by ID",
  description: "Get an Article by ID",
  tags: ["Articles"],
  pathParams: z.object({
    id: z.string().describe("ID of the article"),
  }),
  action: async ({ pathParams }) => {
    const id = Number(pathParams.id);

    if (isNaN(id)) {
      throw new DomainNotFoundError(pathParams.id, "Article")
    }

    if (id === 999) {
      throw new DomainNotFoundError(pathParams.id, "Article")
    }

    const body = await applicationContext().get("GetArticleByIdUseCase").get(id);

    return Response.json(body);
  },
  responses: {
    200: { description: "Article Fetched", content: articleSchema },
    404: { description: "Article Not Found", content: apiErrorSchema },
  },
});

export const { PUT } = defineRoute({
  operationId: "updateArticleById",
  method: 'PUT',
  summary: "Update an Article by ID",
  description: "Update an Article by ID",
  tags: ["Articles"],
  security: [{ bearerAuth: [] }], // required bearer auth
  pathParams: z.object({
    id: z.string().describe("ID of the article"),
  }),
  requestBody: articleUpdateSchema,
  action: async ({ pathParams, body }) => {
    const id = Number(pathParams.id);

    if (isNaN(id)) {
      throw new DomainNotFoundError(pathParams.id, "Article")
    }

    await applicationContext().get("UpdateArticleUseCase").update(id, body);

    return new Response(null, { status: 200 });
  },
  responses: {
    200: { description: "Article Updated", content: articleUpdateSchema },
    401: { description: "Unauthorized", content: apiErrorSchema },
  },
})

export const { DELETE } = defineRoute({
  operationId: "deleteArticleById",
  method: 'DELETE',
  summary: "Delete an Article by ID",
  description: "Delete an Article by ID",
  tags: ["Articles"],
  security: [{ bearerAuth: [] }], // required bearer auth
  pathParams: z.object({
    id: z.string().describe("ID of the article"),
  }),
  action: async ({ pathParams }) => {
    const id = Number(pathParams.id);

    if (isNaN(id)) {
      throw new DomainNotFoundError(pathParams.id, "Article")
    }

    await applicationContext().get("DeleteArticleUseCase").delete(id);

    return new Response(null, { status: 200 });
  },
  responses: {
    200: { description: "Article Deleted" },
    401: { description: "Unauthorized", content: apiErrorSchema },
  },
})