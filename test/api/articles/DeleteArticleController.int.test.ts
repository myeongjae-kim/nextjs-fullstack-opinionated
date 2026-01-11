import { dbLocal } from "@/test/dbLocal";
import { spec } from "pactum";
import { describe, it } from "vitest";
import { ArticleControllerTestDataInitializer } from "./ArticleControllerTestDataInitializer";

describe("DELETE /api/articles/[id]", () => {
  it("should return 204", async () => {
    const authResponse = await new ArticleControllerTestDataInitializer(dbLocal).initialize();

    await spec()
      .delete("/api/articles/1")
      .withBearerToken(authResponse.access_token)
      .expectStatus(204)
      .expectBody("");
  });

  it("should return 401 when invalid token", async () => {
    await spec()
      .delete("/api/articles/1")
      .withHeaders("Authorization", "Bearer invalid-token-value")
      .expectStatus(401);
  });
});