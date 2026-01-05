import { testEnv } from "@/test/testEnv";
import { spec } from "pactum";
import { describe, expect, it } from "vitest";

describe("GET /api/articles/[id]", () => {
  it("should return 200", async () => {
    const response = await fetch(`${testEnv.TEST_HOST}/api/articles/1`);
    await expect(response.json()).resolves.toMatchObject({
      id: 1,
      title: "Article 1",
      content: "Content of article 1",
    });
    expect(response.status).toBe(200);
  });

  it("should return 404 when id is 999", async () => {
    const response = await fetch(`${testEnv.TEST_HOST}/api/articles/999`);
    await expect(response.json()).resolves.toMatchObject({
      "code": "CODE_002",
      "error": "DOMAIN_NOT_FOUND_ERROR",
      "message": "Article #999 not found",
      "status": 404,
      "timestamp": expect.any(String),
    });
    expect(response.status).toBe(404);
  });
});

describe("PUT /api/articles/[id]", () => {
  it("should return 200", async () => {
    await spec()
      .put("/api/articles/1")
      .withBearerToken(testEnv.TEST_BEARER_TOKEN)
      .withBody({
        title: "Article 1",
        content: "Content of article 1",
      })
      .expectBody("")
      .expectStatus(200)
  });

  it("should return 401 when invalid token", async () => {
    const response = await fetch(`${testEnv.TEST_HOST}/api/articles/1`, {
      method: "PUT",
      headers: {
        Authorization: "Bearer invalid-token-value",
      },
      body: JSON.stringify({
        title: "Article 1",
        content: "Content of article 1",
      }),
    });
    expect(response.status).toBe(401);
  });
});

describe("DELETE /api/articles/[id]", () => {
  it("should return 200", async () => {
    const response = await fetch(`${testEnv.TEST_HOST}/api/articles/1`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer default-token-value-for-docs",
      },
    });
    expect(response.status).toBe(200);
  });

  it("should return 401 when invalid token", async () => {
    const response = await fetch(`${testEnv.TEST_HOST}/api/articles/1`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer invalid-token-value",
      },
    });
    expect(response.status).toBe(401);
  });
});