import { user } from '@/lib/db/schema.ts';
import { dbLocal } from '@/test/dbLocal.ts';
import { intTestDefaultOptions } from '@/test/intTestDefaultOptions.ts';
import { setupIntTest } from '@/test/setupIntTest.ts';
import { beforeAll, describe, it } from '@std/testing/bdd';
import pactum from 'pactum';

const spec = pactum.spec;

describe('POST /api/users/signup', intTestDefaultOptions, () => {
  beforeAll(() => {
    setupIntTest();
  });

  it('should return 200 with access_token and refresh_token', async () => {
    await dbLocal.delete(user);

    await spec()
      .post('/api/users/signup')
      .withBody({
        loginId: 'testuser',
        password: 'password123',
        name: 'Test User',
      })
      .expectStatus(200)
      .expectJsonLike({
        access_token: /.*/,
        refresh_token: /.*/,
      });
  });

  it('should return 200 without name', async () => {
    await dbLocal.delete(user);

    await spec()
      .post('/api/users/signup')
      .withBody({
        loginId: 'testuser2',
        password: 'password123',
      })
      .expectStatus(200)
      .expectJsonLike({
        access_token: /.*/,
        refresh_token: /.*/,
      });
  });

  it('should return 400 when loginId is missing', async () => {
    await spec()
      .post('/api/users/signup')
      .withBody({
        password: 'password123',
      })
      .expectStatus(400);
  });

  it('should return 400 when password is missing', async () => {
    await spec()
      .post('/api/users/signup')
      .withBody({
        loginId: 'testuser',
      })
      .expectStatus(400);
  });
});
