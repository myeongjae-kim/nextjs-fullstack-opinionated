import { article } from '@/lib/db/schema.ts';
import { dbLocal } from '@/test/dbLocal.ts';
import { intTestDefaultOptions } from '@/test/intTestDefaultOptions.ts';
import { setupIntTest } from '@/test/setupIntTest.ts';
import { beforeAll, describe, it } from '@std/testing/bdd';
import pactum from 'pactum';

const spec = pactum.spec;

describe('GET /api/articles/[id]', intTestDefaultOptions, () => {
  beforeAll(() => {
    setupIntTest();
  });

  it('should return 200', async () => {
    await dbLocal.delete(article);
    await dbLocal.insert(article).values({
      id: 1,
      title: 'Article 1',
      content: 'Content of article 1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });


    await spec()
      .get('/api/articles/1')
      .expectStatus(200)
      .expectJsonLike({
        id: 1,
        title: 'Article 1',
        content: 'Content of article 1',
        createdAt: /.*/,
        updatedAt: /.*/,
      });
  });

  it('should return 404 when id is 999', async () => {
    await spec()
      .get('/api/articles/999')
      .expectStatus(404)
      .expectJsonLike({
        'code': '',
        'error': 'DOMAIN_NOT_FOUND_ERROR',
        'message': 'Article #999 not found',
        'status': 404,
        'timestamp': /.*/,
      });
  });
});
