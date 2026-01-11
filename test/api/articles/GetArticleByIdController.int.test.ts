import { article } from "@/lib/db/schema";
import { dbLocal } from "@/test/dbLocal";
import { spec } from "pactum";
import { describe, it } from "vitest";

describe("GET /api/articles/[id]", () => {
  it("should return 200", async () => {
    await dbLocal.delete(article);
    await dbLocal.insert(article).values({
      id: 1,
      title: "Article 1",
      content: "Content of article 1",
      createdAt: new Date(),
      updatedAt: new Date(),
    });


    await spec()
      .get("/api/articles/1")
      .expectStatus(200)
      .expectJsonLike({
        id: 1,
        title: "Article 1",
        content: "Content of article 1",
        createdAt: /.*/,
        updatedAt: /.*/,
      });
  });

  it("should return 404 when id is 999", async () => {
    await spec()
      .get("/api/articles/999")
      .expectStatus(404)
      .expectJsonLike({
        "code": "CODE_002",
        "error": "DOMAIN_NOT_FOUND_ERROR",
        "message": "Article #999 not found",
        "status": 404,
        "timestamp": /.*/,
      });
  });
});
