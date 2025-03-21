export class MissingCartError extends Error {
  constructor() {
    super('Cart was not returned in response');
    this.name = 'MissingCartError';
  }
}
