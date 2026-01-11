import { AuthResponse } from "@/core/common/domain/AuthResponse";
import { user } from "@/lib/db/schema";
import { dbLocal } from "@/test/dbLocal";
import { spec } from "pactum";
import { describe, it } from "vitest";

describe("GET /api/users/me", () => {
  it("should return 200 with user details", async () => {
    await dbLocal.delete(user);

    // First sign up to get a token
    const signUpResponse: AuthResponse = await spec()
      .post("/api/users/signup")
      .withBody({
        loginId: "meuser",
        password: "password123",
      })
      .expectStatus(200)
      .returns("res.body");

    const accessToken = signUpResponse.access_token;

    await spec()
      .get("/api/users/me")
      .withBearerToken(accessToken)
      .expectStatus(200)
      .expectJsonLike({
        ulid: /.*/,
        role: "member",
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
