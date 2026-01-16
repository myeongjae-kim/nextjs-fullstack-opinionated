import { dbLocal } from "@/test/dbLocal.ts";
import { beforeAll, describe, it } from "@std/testing/bdd";
import pactum from "pactum";
import { intTestDefaultOptions } from "../../intTestDefaultOptions.ts";
import { setupIntTest } from "../../setupIntTest.ts";
import { ArticleControllerTestDataInitializer } from "./ArticleControllerTestDataInitializer.ts";

const spec = pactum.spec;

describe('POST /api/articles', intTestDefaultOptions, () => {
  beforeAll(() => {
    setupIntTest();
  })

  it('should return 200', async () => {
    const authResponse = await new ArticleControllerTestDataInitializer(dbLocal).initialize();

    await spec()
      .post('/api/articles')
      .withBearerToken(authResponse.access_token)
      .withBody({
        title: 'Article 1',
        content: 'Content of article 1',
      })
      .expectStatus(200)
      .expectJsonLike({
        id: /\d*/,
      });
  });

  it('should return 401 when invalid token', async () => {
    await spec()
      .post('/api/articles')
      .withHeaders('Authorization', 'Bearer invalid-token-value')
      .expectStatus(401);
  });
});