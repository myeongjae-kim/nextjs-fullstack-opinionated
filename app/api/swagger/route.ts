import { articleCreationSchema, articleListSchema, articleSchema, articleUpdateSchema } from "@/core/article/domain/Article";
import { apiErrorSchema } from "@/core/common/domain/ApiError";
import { creationResponseSchema } from "@/core/common/domain/CreationResponse";
import generateOpenApiSpec from "@omer-x/next-openapi-json-generator";

export const dynamic = 'force-static'; // if not force static, it will throw error on Vercel

export const GET = async () => {
  const spec = await generateOpenApiSpec({
    articleSchema,
    articleCreationSchema,
    articleUpdateSchema,
    articleListSchema,
    apiErrorSchema,
    creationResponseSchema
  }, {
    info: {
      title: "Next.js API Docs with next-openapi-route-handler",
      version: "1.0.0",
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        description: 'Token Description',
      },
    },
  });

  return Response.json(spec);
}