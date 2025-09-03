import { BigCommerceAPIError } from './api-error';
import { BigCommerceAuthError } from './gql-auth-error';
import { BigCommerceGQLError } from './gql-error';
import { parseGraphQLError } from './lib/error';
import { DocumentDecoration } from './types';
import { getOperationInfo } from './utils/getOperationName';
import { normalizeQuery } from './utils/normalizeQuery';
import { getBackendUserAgent } from './utils/userAgent';

export const graphqlApiDomain: string =
  process.env.BIGCOMMERCE_GRAPHQL_API_DOMAIN ?? 'mybigcommerce.com';

export const adminApiHostname: string =
  process.env.BIGCOMMERCE_ADMIN_API_HOST ?? 'api.bigcommerce.com';

interface Config<FetcherRequestInit extends RequestInit = RequestInit> {
  storeHash: string;
  storefrontToken: string;
  channelId?: string;
  platform?: string;
  backendUserAgentExtensions?: string;
  logger?: boolean;
  customFetch?: (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
  getChannelId?: (defaultChannelId: string) => Promise<string> | string;
  beforeRequest?: (
    fetchOptions?: FetcherRequestInit,
  ) => Promise<Partial<FetcherRequestInit> | undefined> | Partial<FetcherRequestInit> | undefined;
  onError?: (
    error: BigCommerceGQLError,
    queryType: 'query' | 'mutation' | 'subscription',
  ) => Promise<void> | void;
}

interface BigCommerceResponseError {
  message: string;
  locations: Array<{
    line: number;
    column: number;
  }>;
  path: string[];
}

interface BigCommerceResponse<T> {
  data: T;
  errors?: BigCommerceResponseError[];
}

type GraphQLErrorPolicy = 'none' | 'all' | 'auth' | 'ignore';

class Client<FetcherRequestInit extends RequestInit = RequestInit> {
  private backendUserAgent: string;
  private readonly defaultChannelId: string;
  private customFetch?: (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
  private getChannelId: (defaultChannelId: string) => Promise<string> | string;
  private beforeRequest?: (
    fetchOptions?: FetcherRequestInit,
  ) => Promise<Partial<FetcherRequestInit> | undefined> | Partial<FetcherRequestInit> | undefined;
  private onError?: (
    error: BigCommerceGQLError,
    queryType: 'query' | 'mutation' | 'subscription',
  ) => Promise<void> | void;

  private trustedProxySecret = process.env.BIGCOMMERCE_TRUSTED_PROXY_SECRET;

  constructor(private config: Config<FetcherRequestInit>) {
    if (!config.channelId) {
      throw new Error('Client configuration must include a channelId.');
    }

    this.defaultChannelId = config.channelId;
    this.backendUserAgent = getBackendUserAgent(config.platform, config.backendUserAgentExtensions);
    this.customFetch = config.customFetch;

    this.getChannelId =
      config.getChannelId ??
      function defaultChannelIdFn(defaultChannelId) {
        return defaultChannelId;
      };

    this.beforeRequest = config.beforeRequest;
    this.onError = config.onError;
  }

  // Overload for documents that require variables
  async fetch<TResult, TVariables extends Record<string, unknown>>(config: {
    document: DocumentDecoration<TResult, TVariables>;
    variables: TVariables;
    customerAccessToken?: string;
    fetchOptions?: FetcherRequestInit;
    channelId?: string;
    errorPolicy?: GraphQLErrorPolicy;
    validateCustomerAccessToken?: boolean;
  }): Promise<BigCommerceResponse<TResult>>;

  // Overload for documents that do not require variables
  async fetch<TResult>(config: {
    document: DocumentDecoration<TResult, Record<string, never>>;
    variables?: undefined;
    customerAccessToken?: string;
    fetchOptions?: FetcherRequestInit;
    channelId?: string;
    errorPolicy?: GraphQLErrorPolicy;
    validateCustomerAccessToken?: boolean;
  }): Promise<BigCommerceResponse<TResult>>;

  async fetch<TResult, TVariables>({
    document,
    variables,
    customerAccessToken,
    fetchOptions = {} as FetcherRequestInit,
    channelId,
    errorPolicy = 'none',
    validateCustomerAccessToken = true,
  }: {
    document: DocumentDecoration<TResult, TVariables>;
    variables?: TVariables;
    customerAccessToken?: string;
    fetchOptions?: FetcherRequestInit;
    channelId?: string;
    errorPolicy?: GraphQLErrorPolicy;
    validateCustomerAccessToken?: boolean;
  }): Promise<BigCommerceResponse<TResult>> {
    const { headers = {}, ...rest } = fetchOptions;
    const query = normalizeQuery(document);
    const log = this.requestLogger(query);
    const operationInfo = getOperationInfo(query);

    const graphqlUrl = await this.getGraphQLEndpoint(
      channelId,
      operationInfo.name,
      operationInfo.type,
    );
    const { headers: additionalFetchHeaders = {}, ...additionalFetchOptions } =
      (await this.beforeRequest?.(fetchOptions)) ?? {};

    const fetchFn = this.customFetch ?? fetch;
    const response = await fetchFn(graphqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.storefrontToken}`,
        'User-Agent': this.backendUserAgent,
        ...(customerAccessToken && { 'X-Bc-Customer-Access-Token': customerAccessToken }),
        ...(validateCustomerAccessToken && {
          'X-Bc-Error-On-Invalid-Customer-Access-Token': 'true',
        }),
        ...(this.trustedProxySecret && { 'X-BC-Trusted-Proxy-Secret': this.trustedProxySecret }),
        ...Object.fromEntries(new Headers(additionalFetchHeaders).entries()),
        ...Object.fromEntries(new Headers(headers).entries()),
      },
      body: JSON.stringify({
        query,
        ...(variables && { variables }),
      }),
      ...additionalFetchOptions,
      ...rest,
    });

    if (!response.ok) {
      throw await BigCommerceAPIError.createFromResponse(response);
    }

    log(response);

    const result = (await response.json()) as BigCommerceResponse<TResult>;

    const { errors, ...data } = result;

    // If errorPolicy is 'none', we throw an error if there are any errors
    if (errorPolicy === 'none' && errors) {
      const error = parseGraphQLError(errors);

      await this.onError?.(error, operationInfo.type);

      throw error;
    }

    if (errorPolicy === 'auth' && errors) {
      const error = parseGraphQLError(errors);

      if (error instanceof BigCommerceAuthError) {
        await this.onError?.(error, operationInfo.type);

        throw error;
      }
    }

    // If errorPolicy is 'ignore', we return the data and ignore the errors
    if (errorPolicy === 'ignore') {
      return data;
    }

    // If errorPolicy is 'all', we return the errors with the data
    return result;
  }

  async fetchSitemapIndex(channelId?: string): Promise<string> {
    const sitemapIndexUrl = `${await this.getCanonicalUrl(channelId)}/xmlsitemap.php`;

    const response = await fetch(sitemapIndexUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/xml',
        'Content-Type': 'application/xml',
        'User-Agent': this.backendUserAgent,
        ...(this.trustedProxySecret && { 'X-BC-Trusted-Proxy-Secret': this.trustedProxySecret }),
      },
    });

    if (!response.ok) {
      throw new Error(`Unable to get Sitemap Index: ${response.statusText}`);
    }

    return response.text();
  }

  private async getCanonicalUrl(channelId?: string) {
    const resolvedChannelId = channelId ?? (await this.getChannelId(this.defaultChannelId));

    return `https://store-${this.config.storeHash}-${resolvedChannelId}.${graphqlApiDomain}`;
  }

  private async getGraphQLEndpoint(
    channelId?: string,
    operationName?: string,
    operationType?: string,
  ) {
    const baseUrl = new URL(`${await this.getCanonicalUrl(channelId)}/graphql`);

    if (operationName) {
      baseUrl.searchParams.set('operation', operationName);
    }

    if (operationType) {
      baseUrl.searchParams.set('type', operationType);
    }

    return baseUrl.toString();
  }

  private requestLogger(document: string) {
    if (!this.config.logger) {
      return () => {
        // noop
      };
    }

    const { name, type } = getOperationInfo(document);

    const timeStart = performance.now();

    return (response: Response) => {
      const timeEnd = performance.now();
      const duration = (timeEnd - timeStart).toFixed(2);

      const complexity = response.headers.get('x-bc-graphql-complexity');

      // eslint-disable-next-line no-console
      console.log(
        `[BigCommerce] ${type} ${name ?? 'anonymous'} - ${duration}ms - complexity ${complexity ?? 'unknown'}`,
      );
    };
  }
}

export function createClient<FetcherRequestInit extends RequestInit = RequestInit>(
  config: Config<FetcherRequestInit>,
) {
  return new Client<FetcherRequestInit>(config);
}
