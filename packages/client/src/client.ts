import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';

import { BigCommerceAPIError } from './error';
import { getOperationInfo } from './utils/getOperationName';
import { getBackendUserAgent } from './utils/userAgent';

export const graphqlApiDomain: string =
  process.env.BIGCOMMERCE_GRAPHQL_API_DOMAIN ?? 'mybigcommerce.com';

export const adminApiHostname: string =
  process.env.BIGCOMMERCE_ADMIN_API_HOST ?? 'api.bigcommerce.com';

interface Config {
  storeHash: string;
  customerImpersonationToken: string;
  xAuthToken: string;
  channelId?: string;
  platform?: string;
  backendUserAgentExtensions?: string;
  logger?: boolean;
}

interface BigCommerceResponse<T> {
  data: T;
}

class Client<FetcherRequestInit extends RequestInit = RequestInit> {
  private graphqlUrl: string;
  private backendUserAgent: string;

  constructor(private config: Config) {
    this.graphqlUrl = this.getEndpoint();
    this.backendUserAgent = getBackendUserAgent(config.platform, config.backendUserAgentExtensions);
  }

  // Overload for documents that require variables
  async fetch<TResult, TVariables extends Record<string, unknown>>(config: {
    document: DocumentTypeDecoration<TResult, TVariables>;
    variables: TVariables;
    customerId?: number;
    fetchOptions?: FetcherRequestInit;
  }): Promise<BigCommerceResponse<TResult>>;

  // Overload for documents that do not require variables
  async fetch<TResult>(config: {
    document: DocumentTypeDecoration<TResult, Record<string, never>>;
    variables?: undefined;
    customerId?: number;
    fetchOptions?: FetcherRequestInit;
  }): Promise<BigCommerceResponse<TResult>>;

  async fetch<TResult, TVariables>({
    document,
    variables,
    customerId,
    fetchOptions = {} as FetcherRequestInit,
  }: {
    document: DocumentTypeDecoration<TResult, TVariables>;
    variables?: TVariables;
    customerId?: number;
    fetchOptions?: FetcherRequestInit;
  }): Promise<BigCommerceResponse<TResult>> {
    const { cache, headers = {}, ...rest } = fetchOptions;
    const log = this.requestLogger(document);

    const response = await fetch('https://deini-proxy.bigcommerce-testing-7727.workers.dev/proxy?proxyUrl=' + this.graphqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.customerImpersonationToken}`,
        'User-Agent': this.backendUserAgent,
        ...(customerId && { 'X-Bc-Customer-Id': String(customerId) }),
        ...headers,
      },
      body: JSON.stringify({
        query: document,
        ...(variables && { variables }),
      }),
      ...(cache && { cache }),
      ...rest,
    });

    if (!response.ok) {
      throw await BigCommerceAPIError.createFromResponse(response);
    }

    log();

    return response.json() as Promise<BigCommerceResponse<TResult>>;
  }

  async fetchCartRedirectUrls<TResult>(cartId: string) {
    const response = await fetch(
      `https://${adminApiHostname}/stores/${this.config.storeHash}/v3/carts/${cartId}/redirect_urls`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Auth-Token': this.config.xAuthToken,
          'User-Agent': this.backendUserAgent,
        },
        cache: 'no-store',
        body: JSON.stringify({
          cart_id: cartId,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Unable to get checkout URL: ${response.statusText}`);
    }

    return response.json() as Promise<BigCommerceResponse<TResult>>;
  }

  private getEndpoint() {
    if (!this.config.channelId || this.config.channelId === '1') {
      return `https://store-${this.config.storeHash}.${graphqlApiDomain}/graphql`;
    }

    return `https://store-${this.config.storeHash}-${this.config.channelId}.${graphqlApiDomain}/graphql`;
  }

  private requestLogger<TResult, TVariables>(
    document: DocumentTypeDecoration<TResult, TVariables>,
  ) {
    if (!this.config.logger) {
      return () => {
        // noop
      };
    }

    const { name, type } = getOperationInfo(document);

    const timeStart = Date.now();

    return () => {
      const timeEnd = Date.now();
      const duration = timeEnd - timeStart;

      // eslint-disable-next-line no-console
      console.log(`[BigCommerce] ${type} ${name ?? 'anonymous'} - ${duration}ms`);
    };
  }
}

export function createClient<FetcherRequestInit extends RequestInit = RequestInit>(config: Config) {
  return new Client<FetcherRequestInit>(config);
}
