import { testEnv } from "@/test/testEnv";
import { spec } from "pactum";
import { describe, it } from "vitest";

describe("POST /api/articles", () => {
  it("should return 200", async () => {
    await spec()
      .post("/api/articles")
      .withBearerToken(testEnv.TEST_BEARER_TOKEN)
      .withBody({
        title: "Article 1",
        content: "Content of article 1",
      })
      .expectStatus(200)
      .expectJson({
        id: 1,
      });
  });

  it("should return 401 when invalid token", async () => {
    await spec()
      .post("/api/articles")
      .withHeaders("Authorization", "Bearer invalid-token-value")
      .expectStatus(401);
  });
});
