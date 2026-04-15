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

interface ClientConfig {
  storeHash: string;
  storefrontToken: string;
  channelId: string;
  channelIdsByLocale?: Record<string, string>;
  platform?: string;
  backendUserAgentExtensions?: string;
  logger?: boolean;
  getHeaders?: () => Record<string, string>;
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

class Client {
  private backendUserAgent: string;
  private readonly defaultChannelId: string;
  private onError?: (
    error: BigCommerceGQLError,
    queryType: 'query' | 'mutation' | 'subscription',
  ) => Promise<void> | void;

  private trustedProxySecret = process.env.BIGCOMMERCE_TRUSTED_PROXY_SECRET;

  constructor(private config: ClientConfig) {
    this.defaultChannelId = config.channelId;
    this.backendUserAgent = getBackendUserAgent(config.platform, config.backendUserAgentExtensions);
    this.onError = config.onError;
  }

  // Overload for documents that require variables
  async fetch<TResult, TVariables extends Record<string, unknown>>(config: {
    document: DocumentDecoration<TResult, TVariables>;
    variables: TVariables;
    locale?: string;
    channelId?: string;
    customerAccessToken?: string;
    headers?: Record<string, string>;
    errorPolicy?: GraphQLErrorPolicy;
    validateCustomerAccessToken?: boolean;
  }): Promise<BigCommerceResponse<TResult>>;

  // Overload for documents that do not require variables
  async fetch<TResult>(config: {
    document: DocumentDecoration<TResult, Record<string, never>>;
    variables?: undefined;
    locale?: string;
    channelId?: string;
    customerAccessToken?: string;
    headers?: Record<string, string>;
    errorPolicy?: GraphQLErrorPolicy;
    validateCustomerAccessToken?: boolean;
  }): Promise<BigCommerceResponse<TResult>>;

  async fetch<TResult, TVariables>({
    document,
    variables,
    locale,
    channelId,
    customerAccessToken,
    headers: requestHeaders,
    errorPolicy = 'none',
    validateCustomerAccessToken = true,
  }: {
    document: DocumentDecoration<TResult, TVariables>;
    variables?: TVariables;
    locale?: string;
    channelId?: string;
    customerAccessToken?: string;
    headers?: Record<string, string>;
    errorPolicy?: GraphQLErrorPolicy;
    validateCustomerAccessToken?: boolean;
  }): Promise<BigCommerceResponse<TResult>> {
    const query = normalizeQuery(document);
    const log = this.requestLogger(query);
    const operationInfo = getOperationInfo(query);

    const graphqlUrl = this.getGraphQLEndpoint(
      operationInfo.name,
      operationInfo.type,
      channelId,
      locale,
    );

    const response = await fetch(graphqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.storefrontToken}`,
        'User-Agent': this.backendUserAgent,
        ...(this.trustedProxySecret && { 'X-BC-Trusted-Proxy-Secret': this.trustedProxySecret }),
        ...(locale && { 'Accept-Language': locale }),
        ...(customerAccessToken && { 'X-Bc-Customer-Access-Token': customerAccessToken }),
        ...(validateCustomerAccessToken && {
          'X-Bc-Error-On-Invalid-Customer-Access-Token': 'true',
        }),
        ...this.config.getHeaders?.(),
        ...requestHeaders,
      },
      body: JSON.stringify({
        query,
        ...(variables && { variables }),
      }),
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
    const sitemapIndexUrl = `${this.getCanonicalUrl(channelId)}/xmlsitemap.php`;

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

  private resolveChannelId(channelId?: string, locale?: string): string {
    if (channelId) return channelId;

    if (locale && this.config.channelIdsByLocale?.[locale]) {
      return this.config.channelIdsByLocale[locale];
    }

    return this.defaultChannelId;
  }

  private getCanonicalUrl(channelId?: string, locale?: string): string {
    const resolvedChannelId = this.resolveChannelId(channelId, locale);

    return `https://store-${this.config.storeHash}-${resolvedChannelId}.${graphqlApiDomain}`;
  }

  private getGraphQLEndpoint(
    operationName?: string,
    operationType?: string,
    channelId?: string,
    locale?: string,
  ): string {
    const baseUrl = new URL(`${this.getCanonicalUrl(channelId, locale)}/graphql`);

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

export function createClient(config: ClientConfig) {
  return new Client(config);
}
