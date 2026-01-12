export class DomainInternalServerError extends Error {
  constructor(message?: string) {
    super(message ?? 'An unexpected error occurred');
  }
}