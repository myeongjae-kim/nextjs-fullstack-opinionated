import { defineConfig } from "@rcmade/hono-docs";

export default defineConfig({
    apis: [{
        name: "Create Article",
        apiPrefix: "/",
        appTypePath: "./app/api/[...route]/articles/CreateArticleController.ts",
    },
    {
        name: "Delete Article",
        apiPrefix: "/",
        appTypePath: "./app/api/[...route]/articles/DeleteArticleController.ts",
    },
    {
        name: "Find All Articles",
        apiPrefix: "/",
        appTypePath: "./app/api/[...route]/articles/FindAllArticlesController.ts",
    },
    {
        name: "Get Article By Id",
        apiPrefix: "/",
        appTypePath: "./app/api/[...route]/articles/GetArticleByIdController.ts",
    },
    {
        name: "Update Article",
        apiPrefix: "/",
        appTypePath: "./app/api/[...route]/articles/UpdateArticleController.ts",
    }],
    tsConfigPath: "./tsconfig.json",
    openApi: {
        openapi: "3.0.0",
        info: { title: "My API", version: "1.0.0" },
        servers: [{ url: "http://localhost:3000/api" }],
    },
    outputs: {
        openApiJson: "./public/docs/openapi.json",
    },
});