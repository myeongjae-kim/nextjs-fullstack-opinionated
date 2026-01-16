import { isApiAuthRequired } from '@/core/auth/config/securityConfig.ts';
import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";

describe('isApiAuthRequired', () => {
  it('should return true', () => {
    expect(isApiAuthRequired('GET', '/api/articles')).toBe(false);
    expect(isApiAuthRequired('GET', '/api/articles/123')).toBe(false);
    expect(isApiAuthRequired('POST', '/api/articles')).toBe(true);
    expect(isApiAuthRequired('PUT', '/api/articles/123')).toBe(true);
    expect(isApiAuthRequired('DELETE', '/api/articles/123')).toBe(true);
  });
});