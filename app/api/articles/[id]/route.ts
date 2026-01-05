import { apiErrorSchema } from "@/app/domain/ApiError";
import { articleSchema, articleUpdateSchema } from "@/app/domain/Article";
import { DomainNotFoundError } from "@/app/domain/DomainNotFoundError";
import defineRoute from "@/app/util/@omer-x/next-openapi-route-handler";
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

    const body = articleSchema.parse({
      id,
      title: `Article ${id}`,
      content: `Content of article ${id}`,
    })
    return Response.json(body);
  },
  responses: {
    200: { description: "Article Fetched", content: articleSchema },
    404: { description: "Article Not Found", content: apiErrorSchema },
  },
  handleErrors: (errorType, issues) => {
    console.log(issues);
    switch (errorType) {
      case "PARSE_PATH_PARAMS":
        return Response.json({
          message: issues?.[0]?.message,
        }, { status: 404 });
      default:
        return new Response(null, { status: 500 });
    }
  }
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
  action: async () => {
    return new Response(null, { status: 200 });
  },
  responses: {
    200: { description: "Article Updated", content: articleUpdateSchema },
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
  action: async () => {
    return new Response(null, { status: 200 });
  },
  responses: {
    200: { description: "Article Deleted" }
  },
})