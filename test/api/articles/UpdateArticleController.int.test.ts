import { testEnv } from "@/test/testEnv";
import { spec } from "pactum";
import { describe, it } from "vitest";

describe("PUT /api/articles/[id]", () => {
  it("should return 204", async () => {
    await spec()
      .put("/api/articles/1")
      .withBearerToken(testEnv.TEST_BEARER_TOKEN)
      .withBody({
        title: "Article 1",
        content: "Content of article 1",
      })
      .expectStatus(204)
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
