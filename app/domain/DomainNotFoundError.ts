export class DomainNotFoundError extends Error {
  constructor(id: string | number, entityName: string) {
    super(`${entityName} #${id} not found`);
  }
}