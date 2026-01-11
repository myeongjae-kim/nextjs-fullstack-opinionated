import { dbPrimary } from "@/lib/db/drizzle";
import { spec } from "pactum";
import { describe, it } from "vitest";
import { LoginControllerTestDataInitializer } from "./LoginControllerTestDataInitializer";

describe("POST /api/users/login", () => {
  it("should return 200 with access_token and refresh_token", async () => {
    await new LoginControllerTestDataInitializer(dbPrimary).initialize();

    await spec()
      .post("/api/users/login")
      .withBody({
        loginId: "loginuser",
        password: "password123",
      })
      .expectStatus(200)
      .expectJsonLike({
        access_token: /.*/,
        refresh_token: /.*/,
      });
  });

  it("should return 401 when loginId is invalid", async () => {
    await spec()
      .post("/api/users/login")
      .withBody({
        loginId: "nonexistent",
        password: "password123",
      })
      .expectStatus(401)
      .expectJsonLike({
        "code": "CODE_001",
        "error": "DOMAIN_UNAUTHORIZED_ERROR",
        "status": 401,
        "timestamp": /.*/,
      });
  });

  it("should return 401 when password is invalid", async () => {
    await new LoginControllerTestDataInitializer(dbPrimary).initialize();

    // Then try to login with wrong password
    await spec()
      .post("/api/users/login")
      .withBody({
        loginId: "loginuser",
        password: "wrongpassword",
      })
      .expectStatus(401)
      .expectJsonLike({
        "code": "CODE_001",
        "error": "DOMAIN_UNAUTHORIZED_ERROR",
        "status": 401,
        "timestamp": /.*/,
      });
  });

  it("should return 400 when loginId is missing", async () => {
    await spec()
      .post("/api/users/login")
      .withBody({
        password: "password123",
      })
      .expectStatus(400);
  });

  it("should return 400 when password is missing", async () => {
    await spec()
      .post("/api/users/login")
      .withBody({
        loginId: "testuser",
      })
      .expectStatus(400);
  });
});
