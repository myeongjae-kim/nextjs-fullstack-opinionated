import { dbPrimary } from "@/lib/db/drizzle";
import { spec } from "pactum";
import { describe, it } from "vitest";
import { ArticleControllerTestDataInitializer } from "./ArticleControllerTestDataInitializer";

describe("POST /api/articles", () => {
  it("should return 200", async () => {
    const authResponse = await new ArticleControllerTestDataInitializer(dbPrimary).initialize();

    await spec()
      .post("/api/articles")
      .withBearerToken(authResponse.access_token)
      .withBody({
        title: "Article 1",
        content: "Content of article 1",
      })
      .expectStatus(200)
      .expectJsonLike({
        id: /\d*/,
      });
  });

  it("should return 401 when invalid token", async () => {
    await spec()
      .post("/api/articles")
      .withHeaders("Authorization", "Bearer invalid-token-value")
      .expectStatus(401);
  });
});
