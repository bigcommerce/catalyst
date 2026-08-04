import { BigCommerceAPIError } from './api-error';

export class InvalidStorefrontTokenError extends BigCommerceAPIError {
  constructor(
    public status: number,
    graphqlErrors: unknown[] = [],
  ) {
    super(status, graphqlErrors);

    this.name = 'InvalidStorefrontTokenError';
    this.message = [
      `BigCommerce API returned ${status}: the configured storefront token doesn't look like a JWT.`,
      '',
      'BIGCOMMERCE_STOREFRONT_TOKEN must be a storefront API JWT, not an OAuth access token or any other token type.',
      'Generate one via the Storefront API Token endpoint (POST /stores/{store_hash}/v3/storefront/api-token):',
      'https://developer.bigcommerce.com/docs/rest-authentication/tokens#create-a-token',
    ].join('\n');
  }
}
