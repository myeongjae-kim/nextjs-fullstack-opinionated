import { testEnv } from "@/test/testEnv";
import { spec } from "pactum";
import { describe, it } from "vitest";

describe("GET /api/articles/[id]", () => {
  it("should return 200", async () => {
    await spec()
      .get("/api/articles/1")
      .expectStatus(200)
      .expectJson({
        id: 1,
        title: "Article 1",
        content: "Content of article 1",
      });
  });

  it("should return 404 when id is 999", async () => {
    await spec()
      .get("/api/articles/999")
      .expectStatus(404)
      .expectJsonLike({
        "code": "CODE_002",
        "error": "DOMAIN_NOT_FOUND_ERROR",
        "message": "Article #999 not found",
        "status": 404,
        "timestamp": /.*/,
      });
  });
});

describe("PUT /api/articles/[id]", () => {
  it("should return 200", async () => {
    await spec()
      .put("/api/articles/1")
      .withBearerToken(testEnv.TEST_BEARER_TOKEN)
      .withBody({
        title: "Article 1",
        content: "Content of article 1",
      })
      .expectStatus(200)
      .expectBody("");
  });

  it("should return 401 when invalid token", async () => {
    await spec()
      .put("/api/articles/1")
      .withHeaders("Authorization", "Bearer invalid-token-value")
      .withBody({
        title: "Article 1",
        content: "Content of article 1",
      })
      .expectStatus(401);
  });
});

describe("DELETE /api/articles/[id]", () => {
  it("should return 200", async () => {
    await spec()
      .delete("/api/articles/1")
      .withBearerToken(testEnv.TEST_BEARER_TOKEN)
      .expectStatus(200)
      .expectBody("");
  });

  it("should return 401 when invalid token", async () => {
    await spec()
      .delete("/api/articles/1")
      .withHeaders("Authorization", "Bearer invalid-token-value")
      .expectStatus(401);
  });
});