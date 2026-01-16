import { isApiAuthRequired } from '@/core/auth/config/securityConfig.js';
import { describe, expect, it } from 'vitest';

describe('isApiAuthRequired', () => {
  it('should return true', () => {
    expect(isApiAuthRequired('GET', '/api/articles')).toBe(false);
    expect(isApiAuthRequired('GET', '/api/articles/123')).toBe(false);
    expect(isApiAuthRequired('POST', '/api/articles')).toBe(true);
    expect(isApiAuthRequired('PUT', '/api/articles/123')).toBe(true);
    expect(isApiAuthRequired('DELETE', '/api/articles/123')).toBe(true);
  });
});