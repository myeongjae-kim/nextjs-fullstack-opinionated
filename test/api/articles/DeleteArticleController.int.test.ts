import { ArticleControllerTestDataInitializer } from '@/test/api/articles/ArticleControllerTestDataInitializer.ts';
import { dbLocal } from '@/test/dbLocal.ts';
import { intTestDefaultOptions } from '@/test/intTestDefaultOptions.ts';
import { setupIntTest } from '@/test/setupIntTest.ts';
import { beforeAll, describe, it } from '@std/testing/bdd';
import pactum from 'pactum';

const spec = pactum.spec;

describe('DELETE /api/articles/[id]', intTestDefaultOptions, () => {
  beforeAll(() => {
    setupIntTest();
  });

  it('should return 204', async () => {
    const authResponse = await new ArticleControllerTestDataInitializer(dbLocal).initialize();

    await spec()
      .delete('/api/articles/1')
      .withBearerToken(authResponse.access_token)
      .expectStatus(204)
      .expectBody('');
  });

  it('should return 401 when invalid token', async () => {
    await spec()
      .delete('/api/articles/1')
      .withHeaders('Authorization', 'Bearer invalid-token-value')
      .expectStatus(401);
  });
});