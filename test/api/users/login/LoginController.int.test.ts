import { LoginControllerTestDataInitializer } from '@/test/api/users/login/LoginControllerTestDataInitializer.ts';
import { dbLocal } from '@/test/dbLocal.ts';
import { intTestDefaultOptions } from '@/test/intTestDefaultOptions.ts';
import { setupIntTest } from '@/test/setupIntTest.ts';
import { beforeAll, describe, it } from '@std/testing/bdd';
import pactum from 'pactum';

const spec = pactum.spec;

describe('POST /api/users/login', intTestDefaultOptions, () => {
  beforeAll(() => {
    setupIntTest();
  });

  it('should return 200 with access_token and refresh_token', async () => {
    await new LoginControllerTestDataInitializer(dbLocal).initialize();

    await spec()
      .post('/api/users/login')
      .withBody({
        loginId: 'loginuser',
        password: 'password123',
      })
      .expectStatus(200)
      .expectJsonLike({
        access_token: /.*/,
        refresh_token: /.*/,
      });
  });

  it('should return 401 when loginId is invalid', async () => {
    await spec()
      .post('/api/users/login')
      .withBody({
        loginId: 'nonexistent',
        password: 'password123',
      })
      .expectStatus(401)
      .expectJsonLike({
        'code': '',
        'error': 'DOMAIN_UNAUTHORIZED_ERROR',
        'status': 401,
        'timestamp': /.*/,
      });
  });

  it('should return 401 when password is invalid', async () => {
    await new LoginControllerTestDataInitializer(dbLocal).initialize();

    // Then try to login with wrong password
    await spec()
      .post('/api/users/login')
      .withBody({
        loginId: 'loginuser',
        password: 'wrongpassword',
      })
      .expectStatus(401)
      .expectJsonLike({
        'code': '',
        'error': 'DOMAIN_UNAUTHORIZED_ERROR',
        'status': 401,
        'timestamp': /.*/,
      });
  });

  it('should return 400 when loginId is missing', async () => {
    await spec()
      .post('/api/users/login')
      .withBody({
        password: 'password123',
      })
      .expectStatus(400);
  });

  it('should return 400 when password is missing', async () => {
    await spec()
      .post('/api/users/login')
      .withBody({
        loginId: 'testuser',
      })
      .expectStatus(400);
  });
});
