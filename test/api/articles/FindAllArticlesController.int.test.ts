import { dbPrimary } from "@/lib/db/drizzle";
import { article } from "@/lib/db/schema";
import { spec } from "pactum";
import { describe, it } from "vitest";

describe("GET /api/articles", () => {
  it("should return 200", async () => {
    await dbPrimary.delete(article);
    await dbPrimary.insert(article).values({
      id: 1,
      title: "Article 1",
      content: "Content of article 1",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await dbPrimary.insert(article).values({
      id: 2,
      title: "Article 2",
      content: "Content of article 2",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await dbPrimary.insert(article).values({
      id: 3,
      title: "Article 3",
      content: "Content of article 3",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await spec()
      .get("/api/articles")
      .expectStatus(200)
      .expectJsonLike({
        content: [
          {
            id: 1,
            title: "Article 1",
            content: "Content of article 1",
            createdAt: /.*/,
            updatedAt: /.*/,
          },
          {
            id: 2,
            title: "Article 2",
            content: "Content of article 2",
            createdAt: /.*/,
            updatedAt: /.*/,
          },
          {
            id: 3,
            title: "Article 3",
            content: "Content of article 3",
            createdAt: /.*/,
            updatedAt: /.*/,
          },
        ],
      });
  });
});