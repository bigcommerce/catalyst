import { createClient } from '@bigcommerce/catalyst-client';
import { headers } from 'next/headers';
import { getLocale as getServerLocale } from 'next-intl/server';

import { getChannelIdFromLocale } from '../channels.config';
import { backendUserAgent } from '../userAgent';

// Cache policy types and constants
export const TAGS = {
  cart: 'cart',
  checkout: 'checkout',
  customer: 'customer',
  product: 'product',
  category: 'category',
  brand: 'brand',
  page: 'page',
} as const;

export type EntityType = (typeof TAGS)[keyof typeof TAGS];

export const revalidate = process.env.DEFAULT_REVALIDATE_TARGET
  ? Number(process.env.DEFAULT_REVALIDATE_TARGET)
  : 3600;

// Cache policy types
export type CachePolicy = 
  | { type: 'anonymous'; entityType?: EntityType; entityId?: string | number }
  | { type: 'doNotCache'; entityType?: EntityType; entityId?: string | number }
  | { 
      type: 'shopper'; 
      customerAccessToken: string | undefined; 
      entityType?: EntityType; 
      entityId?: string | number;
      cacheForCustomer?: boolean;
    };

const getLocale = async () => {
  try {
    const locale = await getServerLocale();

    return locale;
  } catch {
    /**
     * Next-intl `getLocale` only works on the server, and when middleware has run.
     *
     * Instances when `getLocale` will not work:
     * - Requests in middlewares
     * - Requests in `generateStaticParams`
     * - Request in api routes
     * - Requests in static sites without `setRequestLocale`
     */
  }
};

// Create the base client for internal use
const baseClient = createClient({
  storefrontToken: process.env.BIGCOMMERCE_STOREFRONT_TOKEN ?? '',
  xAuthToken: process.env.BIGCOMMERCE_ACCESS_TOKEN ?? '',
  storeHash: process.env.BIGCOMMERCE_STORE_HASH ?? '',
  channelId: process.env.BIGCOMMERCE_CHANNEL_ID,
  backendUserAgentExtensions: backendUserAgent,
  logger:
    (process.env.NODE_ENV !== 'production' && process.env.CLIENT_LOGGER !== 'false') ||
    process.env.CLIENT_LOGGER === 'true',
  getChannelId: async (defaultChannelId: string) => {
    const locale = await getLocale();

    // We use the default channelId as a fallback, but it is not ideal in some scenarios.
    return getChannelIdFromLocale(locale) ?? defaultChannelId;
  },
  beforeRequest: async (fetchOptions) => {
    // We can't serialize a `Headers` object within this method so we have to opt into using a plain object
    const requestHeaders: Record<string, string> = {};
    const locale = await getLocale();

    if (fetchOptions?.cache && ['no-store', 'no-cache'].includes(fetchOptions.cache)) {
      const ipAddress = (await headers()).get('X-Forwarded-For');

      if (ipAddress) {
        requestHeaders['X-Forwarded-For'] = ipAddress;
        requestHeaders['True-Client-IP'] = ipAddress;
      }
    }

    if (locale) {
      requestHeaders['Accept-Language'] = locale;
    }

    return {
      headers: requestHeaders,
    };
  },
});

/**
 * Return standard tags to ensure all resources are cached consistently
 * Allows for cache invalidation of related resources when a single entity is updated
 */
const getTags = async ({ entityType, entityId }: { entityType?: EntityType; entityId?: string | number }) => {
  const storeHash = process.env.BIGCOMMERCE_STORE_HASH ?? '';
  const storeTag = `bc/store/${storeHash}`;
  
  // Since client.getChannelId is private, we'll use the environment variable or default channel ID
  const defaultChannelId = process.env.BIGCOMMERCE_CHANNEL_ID ?? '';
  const locale = await getLocale();
  const channelId = getChannelIdFromLocale(locale) ?? defaultChannelId;
  const channelTag = `${storeTag}/channel/${channelId}`;

  const tags = [
    storeTag,
    channelTag,
  ];

  if (entityType) {
    // Global store tag for entity type
    tags.push(`${storeTag}/${entityType}`);
    // Channel tag for entity type
    tags.push(`${channelTag}/${entityType}`);

    if (entityId) {
      // Global store entity ID tag for entity
      tags.push(`${storeTag}/${entityType}:${entityId}`);
      // Channel entity ID tag for entity
      tags.push(`${channelTag}/${entityType}:${entityId}`);
    }
  }

  return tags;
};

/**
 * Apply cache policy to fetch options
 */
export const applyPolicy = async (
  policy: CachePolicy,
  fetchOptions: RequestInit = {}
): Promise<RequestInit> => {
  const { entityType, entityId } = policy;
  const tags = await getTags({ entityType, entityId });
  
  switch (policy.type) {
    case 'anonymous':
      return {
        ...fetchOptions,
        next: {
          ...fetchOptions.next,
          tags,
        },
      };
      
    case 'doNotCache':
      return {
        ...fetchOptions,
        cache: 'no-store',
        next: {
          ...fetchOptions.next,
          tags,
        },
      };
      
    case 'shopper': {
      const { customerAccessToken, cacheForCustomer = false } = policy;
      
      if (customerAccessToken && !cacheForCustomer) {
        // No-store by default to limit Data Cache writes as the expected hit rate is low
        return {
          ...fetchOptions,
          cache: 'no-store',
          next: {
            ...fetchOptions.next,
            tags,
          },
        };
      }
      
      return {
        ...fetchOptions,
        next: {
          ...fetchOptions.next,
          tags,
        },
      };
    }
  }
};

// Export the client with the new fetch method that requires a cache policy
export const client = {
  /**
   * Fetch data from the BigCommerce API with an explicit cache policy
   */
  fetch: async <TResult, TVariables extends Record<string, unknown>>(
    config: {
      document: Parameters<typeof baseClient.fetch<TResult, TVariables>>[0]['document'];
      variables?: TVariables;
      customerAccessToken?: string;
      policy: CachePolicy;
      channelId?: string;
    }
  ) => {
    const { document, variables, customerAccessToken, policy, channelId } = config;
    
    const fetchOptions = await applyPolicy(policy);
    
    // Use type assertion to handle the document type compatibility
    return baseClient.fetch({
      document,
      variables,
      customerAccessToken,
      fetchOptions,
      channelId,
    } as any); // Using 'any' to bypass the type checking issue
  },
  
  /**
   * Get the channel ID based on the current locale
   */
  getChannelId: async () => {
    const defaultChannelId = process.env.BIGCOMMERCE_CHANNEL_ID ?? '';
    const locale = await getLocale();
    return getChannelIdFromLocale(locale) ?? defaultChannelId;
  }
};

// Helper functions for common cache policy scenarios with object parameters

/**
 * Create an anonymous cache policy for data that is the same for all shoppers
 */
export const anonymousCache = (
  options: { entityType?: EntityType; entityId?: string | number } = {}
): CachePolicy => ({
  type: 'anonymous',
  entityType: options.entityType,
  entityId: options.entityId,
});

/**
 * Create a do-not-cache policy for data that is different for each shopper or should not be cached
 */
export const doNotCache = (
  options: { entityType?: EntityType; entityId?: string | number } = {}
): CachePolicy => ({
  type: 'doNotCache',
  entityType: options.entityType,
  entityId: options.entityId,
});

/**
 * Create a shopper cache policy for data that is cacheable for guests, but not for logged-in customers
 */
export const shopperCache = (
  options: { 
    customerAccessToken: string | undefined; 
    entityType?: EntityType; 
    entityId?: string | number;
    cacheForCustomer?: boolean;
  }
): CachePolicy => ({
  type: 'shopper',
  customerAccessToken: options.customerAccessToken,
  entityType: options.entityType,
  entityId: options.entityId,
  cacheForCustomer: options.cacheForCustomer,
});
