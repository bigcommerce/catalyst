export class BigCommerceAPIError extends Error {
  constructor(
    public status: number,
    public graphqlErrors: unknown[] = [],
  ) {
    const message = `
    BigCommerce API returned ${status}
    ${graphqlErrors.map((error) => JSON.stringify(error, null, 2)).join('\n')}
    `;

    super(message);
    this.name = 'BigCommerceAPIError';
  }

  static async createFromResponse(response: Response) {
    try {
      const errorResponse: unknown = await response.json();

      assertIsErrorResponse(errorResponse);

      return new BigCommerceAPIError(response.status, errorResponse.errors);
    } catch {
      return new BigCommerceAPIError(response.status);
    }
  }
}

function assertIsErrorResponse(value: unknown): asserts value is { errors: unknown[] } {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Expected maybeError to be an object');
  }

  if (!('errors' in value)) {
    throw new Error('Expected maybeError to have an errors property');
  }
}
