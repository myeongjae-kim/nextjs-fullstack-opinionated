import { ArticleControllerTestDataInitializer } from '@/test/api/articles/ArticleControllerTestDataInitializer.js';
import { dbLocal } from '@/test/dbLocal.js';
import { spec } from 'pactum';
import { describe, it } from 'vitest';

describe('POST /api/articles', () => {
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
