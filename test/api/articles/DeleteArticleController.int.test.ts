import { testEnv } from "@/test/testEnv";
import { spec } from "pactum";
import { describe, it } from "vitest";

describe("DELETE /api/articles/[id]", () => {
  it("should return 204", async () => {
    await spec()
      .delete("/api/articles/1")
      .withBearerToken(testEnv.TEST_BEARER_TOKEN)
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