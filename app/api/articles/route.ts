import { articleCreationSchema, articleListSchema } from "@/app/domain/Article";
import defineRoute from "@/app/util/@omer-x/next-openapi-route-handler";

export const { GET } = defineRoute({
  operationId: "findArticles",
  method: 'GET',
  summary: "Find Articles",
  description: "Find Articles",
  tags: ["Articles"],
  action: async () => {
    const response = articleListSchema.parse({
      content: [1, 2, 3].map((id) => {
        return {
          id,
          title: `Article ${id}`,
          content: `Content of article ${id}`,
        }
      })
    })
    return Response.json(response);
  },
  responses: {
    200: { description: "Article Fetched", content: articleListSchema }
  },
  handleErrors(errorType, issues) {
    return Response.json({
      errorType,
      issues
    }, { status: 500 })
  },
});

export const { POST } = defineRoute({
  operationId: "createArticle",
  method: 'POST',
  summary: "Create an Article",
  description: "Create an Article",
  tags: ["Articles"],
  security: [{ bearerAuth: [] }], // required bearer auth
  action: async () => {
    return Response.json({
      id: 1
    })
  },
  responses: {
    200: { description: "Article Created", content: articleCreationSchema },
  },
})