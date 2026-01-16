import { ArticleControllerTestDataInitializer } from '@/test/api/articles/ArticleControllerTestDataInitializer';
import { dbLocal } from '@/test/dbLocal';
import { spec } from 'pactum';
import { describe, it } from 'vitest';

describe('PUT /api/articles/[id]', () => {
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
