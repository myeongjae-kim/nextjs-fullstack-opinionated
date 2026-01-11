import { AuthResponse } from "@/core/common/domain/AuthResponse";
import { dbPrimary } from "@/lib/db/drizzle";
import { user } from "@/lib/db/schema";
import { spec } from "pactum";
import { describe, it } from "vitest";

describe("POST /api/users/refresh", () => {
  it("should return 200 with new access_token and refresh_token", async () => {
    await dbPrimary.delete(user);

    // First sign up to get tokens

    const signUpResponse: AuthResponse = await spec()
      .post("/api/users/signup")
      .withBody({
        loginId: "refreshtest",
        password: "password123",
      })
      .expectStatus(200)
      .returns("res.body");

    const refreshToken = signUpResponse.refresh_token;

    // Then refresh token
    await spec()
      .post("/api/users/refresh")
      .withBody({
        refresh_token: refreshToken,
      })
      .expectStatus(200)
      .expectJsonLike({
        access_token: /.*/,
        refresh_token: /.*/,
      });
  });

  it("should return 401 when refresh_token is invalid", async () => {
    await spec()
      .post("/api/users/refresh")
      .withBody({
        refresh_token: "invalid-token",
      })
      .expectStatus(401)
      .expectJsonLike({
        "code": "CODE_001",
        "error": "DOMAIN_UNAUTHORIZED_ERROR",
        "status": 401,
        "timestamp": /.*/,
      });
  });

  it("should return 400 when refresh_token is missing", async () => {
    await spec()
      .post("/api/users/refresh")
      .withBody({})
      .expectStatus(400);
  });
});
