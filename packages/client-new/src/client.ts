import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';

import { BigCommerceAPIError } from './error';
import { getOperationInfo } from './utils/getOperationName';

interface Config {
  storeHash: string;
  customerImpersonationToken: string;
  xAuthToken: string;
  channelId?: string;
  logger?: boolean;
}

interface BigCommerceResponse<T> {
  data: T;
}

class Client<FetcherRequestInit extends RequestInit = RequestInit> {
  private graphqlUrl: string;

  constructor(private config: Config) {
    this.graphqlUrl = this.getEndpoint();
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

    const response = await fetch(this.graphqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.customerImpersonationToken}`,
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

  private getEndpoint() {
    if (!this.config.channelId || this.config.channelId === '1') {
      return `https://store-${this.config.storeHash}.mybigcommerce.com/graphql`;
    }

    return `https://store-${this.config.storeHash}-${this.config.channelId}.mybigcommerce.com/graphql`;
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
