import dotenv from 'dotenv';
import { request } from 'pactum';
import { afterEach, beforeEach, vi } from 'vitest';

dotenv.config({ path: '.env' });

const TEST_HOST = 'http://localhost:3031';

// 테스트용 환경변수 설정은 여기에
vi.stubEnv('TEST_HOST', TEST_HOST);

beforeEach(() => {
  request.setBaseUrl(TEST_HOST);
})

afterEach(() => {
});