import { ArticleControllerTestDataInitializer } from '@/test/api/articles/ArticleControllerTestDataInitializer.js';
import { dbLocal } from '@/test/dbLocal.js';
import { spec } from 'pactum';
import { describe, it } from 'vitest';

describe('DELETE /api/articles/[id]', () => {
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