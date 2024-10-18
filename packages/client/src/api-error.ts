export class BigCommerceAPIError extends Error {
  constructor(public status: number) {
    const message = `BigCommerce API returned ${status}`;

    super(message);
    this.name = 'BigCommerceAPIError';
  }
}
