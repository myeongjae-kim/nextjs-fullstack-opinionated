import { ArticleControllerTestDataInitializer } from '@/test/api/articles/ArticleControllerTestDataInitializer.ts';
import { dbLocal } from '@/test/dbLocal.ts';
import { intTestDefaultOptions } from '@/test/intTestDefaultOptions.ts';
import { setupIntTest } from '@/test/setupIntTest.ts';
import { beforeAll, describe, it } from '@std/testing/bdd';
import pactum from 'pactum';

const spec = pactum.spec;

describe('PUT /api/articles/[id]', intTestDefaultOptions, () => {
  beforeAll(() => {
    setupIntTest();
  });

  it('should return 204', async () => {
    const authResponse = await new ArticleControllerTestDataInitializer(dbLocal).initialize();

    await spec()
      .put('/api/articles/1')
      .withBearerToken(authResponse.access_token)
      .withBody({
        title: 'Article 1',
        content: 'Content of article 1',
      })
      .expectStatus(204)
      .expectBody('');
  });

  it('should return 401 when invalid token', async () => {
    await spec()
      .put('/api/articles/1')
      .withHeaders('Authorization', 'Bearer invalid-token-value')
      .withBody({
        title: 'Article 1',
        content: 'Content of article 1',
      })
      .expectStatus(401);
  });
});
