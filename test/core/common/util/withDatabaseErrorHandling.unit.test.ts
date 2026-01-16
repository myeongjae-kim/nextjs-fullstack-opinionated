import { DomainInternalServerError } from '@/core/common/domain/DomainInternalServerError.js';
import { isDatabaseError, withDatabaseErrorHandling } from '@/core/common/util/withDatabaseErrorHandling.js';
import { DrizzleError, DrizzleQueryError } from 'drizzle-orm';
import { describe, expect, it, vi } from 'vitest';

describe('withDatabaseErrorHandling', () => {
  describe('isDatabaseError', () => {
    it('should return true for DrizzleQueryError', () => {
      // DrizzleQueryError constructor: (query: string, params: any[], cause?: Error)
      const error = new DrizzleQueryError('Failed query', []);
      expect(isDatabaseError(error)).toBe(true);
    });

    it('should return false for other errors', () => {
      const error = new Error('Normal error');
      expect(isDatabaseError(error)).toBe(false);
    });

    it('should return false for general DrizzleError (not QueryError)', () => {
      const error = new DrizzleError({ message: 'Some drizzle error' });
      expect(isDatabaseError(error)).toBe(false);
    });
  });

  describe('withDatabaseErrorHandling Proxy', () => {
    it('should re-throw DomainInternalServerError when DrizzleQueryError occurs', async () => {
      class MockAdapter {
        someQuery(): Promise<void> {
          throw new DrizzleQueryError('Failed query', []);
        }
      }

      const adapter = withDatabaseErrorHandling(new MockAdapter());

      await expect(adapter.someQuery()).rejects.toThrow(DomainInternalServerError);
    });

    it('should include the cause message in DomainInternalServerError when cause is provided', async () => {
      const causeMessage = 'expected cause message';
      class MockAdapter {
        someQuery(): Promise<void> {
          throw new DrizzleQueryError('Failed query', [], new Error(causeMessage));
        }
      }

      const adapter = withDatabaseErrorHandling(new MockAdapter());

      try {
        await adapter.someQuery();
      } catch (error) {
        expect(error).toBeInstanceOf(DomainInternalServerError);
        expect((error as DomainInternalServerError).message).toBe(causeMessage);
      }
    });

    it('should throw original error when it is not a DrizzleQueryError', async () => {
      class MockAdapter {
        someQuery(): Promise<void> {
          throw new Error('Normal error');
        }
      }

      const adapter = withDatabaseErrorHandling(new MockAdapter());

      await expect(adapter.someQuery()).rejects.toThrow('Normal error');
    });

    it('should return successful result when no error occurs', async () => {
      class MockAdapter {
        someQuery(): Promise<string> {
          return Promise.resolve('success');
        }
      }

      const adapter = withDatabaseErrorHandling(new MockAdapter());
      const result = await adapter.someQuery();

      expect(result).toBe('success');
    });

    it('should log the database error to console.error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
      const dbError = new DrizzleQueryError('Failed query', []);

      class MockAdapter {
        someQuery(): Promise<void> {
          throw dbError;
        }
      }

      const adapter = withDatabaseErrorHandling(new MockAdapter());

      try {
        await adapter.someQuery();
      } catch (ignoreError) {
        // ignore
      }

      expect(consoleSpy).toHaveBeenCalledWith('Database error:', dbError);
      consoleSpy.mockRestore();
    });

    it('should correctly handle non-async functions by returning a promise (as per implementation)', async () => {
      class MockAdapter {
        someSyncMethod() {
          return 'sync result';
        }

        throwSyncDbError() {
          throw new DrizzleQueryError('Sync failed query', []);
        }
      }

      const adapter = withDatabaseErrorHandling(new MockAdapter());

      // The implementation wraps functions in an async wrapper, so it returns a promise
      // We use type assertion to satisfy the linter about the returned Promise
      const resultPromise = adapter.someSyncMethod() as unknown as Promise<string>;
      const result = await resultPromise;
      expect(result).toBe('sync result');

      await expect(adapter.throwSyncDbError() as unknown as Promise<void>).rejects.toThrow(DomainInternalServerError);
    });
  });
});
