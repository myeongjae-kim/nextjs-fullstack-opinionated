import { spec } from "pactum";
import { describe, it } from "vitest";

describe("POST /api/users/signup", () => {
  it("should return 200 with access_token and refresh_token", async () => {
    await spec()
      .post("/api/users/signup")
      .withBody({
        loginId: "testuser",
        password: "password123",
        name: "Test User",
      })
      .expectStatus(200)
      .expectJsonLike({
        access_token: /.*/,
        refresh_token: /.*/,
      });
  });

  it("should return 200 without name", async () => {
    await spec()
      .post("/api/users/signup")
      .withBody({
        loginId: "testuser2",
        password: "password123",
      })
      .expectStatus(200)
      .expectJsonLike({
        access_token: /.*/,
        refresh_token: /.*/,
      });
  });

  it("should return 400 when loginId is missing", async () => {
    await spec()
      .post("/api/users/signup")
      .withBody({
        password: "password123",
      })
      .expectStatus(400);
  });

  it("should return 400 when password is missing", async () => {
    await spec()
      .post("/api/users/signup")
      .withBody({
        loginId: "testuser",
      })
      .expectStatus(400);
  });
});
