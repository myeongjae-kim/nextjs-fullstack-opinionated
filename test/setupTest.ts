import { cleanup } from '@testing-library/react';
import { request } from 'pactum';
import { afterEach, beforeEach, vi } from 'vitest';

const TEST_HOST = 'http://localhost:3031';

// 테스트를 위한 환경변수 설정은 여기에
vi.stubEnv('TEST_HOST', TEST_HOST);
vi.stubEnv("TEST_BEARER_TOKEN", "default-token-value-for-docs")

beforeEach(() => {
  request.setBaseUrl(TEST_HOST);
})

afterEach(() => {
  cleanup();
});