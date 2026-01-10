import { testEnv } from "@/test/testEnv";
import { spec } from "pactum";
import { describe, it } from "vitest";

describe("GET /api/users/me", () => {
  it("should return 200 with user details", async () => {
    await spec()
      .get("/api/users/me")
      .withBearerToken(testEnv.TEST_BEARER_TOKEN)
      .expectStatus(200)
      .expectJson({
        username: "uuid",
      });
  });

  it("should return 401 when no token", async () => {
    await spec()
      .get("/api/users/me")
      .expectStatus(401)
      .expectJsonLike({
        "code": "CODE_001",
        "error": "DOMAIN_UNAUTHORIZED_ERROR",
        "status": 401,
        "timestamp": /.*/,
      });
  });

  it("should return 401 when invalid token", async () => {
    await spec()
      .get("/api/users/me")
      .withHeaders("Authorization", "Bearer invalid-token-value")
      .expectStatus(401)
      .expectJsonLike({
        "code": "CODE_001",
        "error": "DOMAIN_UNAUTHORIZED_ERROR",
        "status": 401,
        "timestamp": /.*/,
      });
  });
});
