export class DomainUnauthorizedError extends Error {
  constructor(message?: string) {
    super(message ?? 'Authentication required');
  }
}