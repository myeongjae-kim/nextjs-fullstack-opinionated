import { defineConfig } from "@rcmade/hono-docs";

export default defineConfig({
    apis: [{
        name: "Articles",
        apiPrefix: "/",
        appTypePath: "./app/api/[...route]/articles/ArticleController.ts",
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