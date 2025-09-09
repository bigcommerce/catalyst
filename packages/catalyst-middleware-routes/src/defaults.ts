import { RouteMappings, RedirectConfig, CacheConfig, AnalyticsConfig } from './types';

export const DEFAULT_ROUTE_MAPPINGS: RouteMappings = {
  Brand: {
    pathTemplate: '/${locale}/brand/${entityId}',
    recordAnalytics: false,
  },
  Category: {
    pathTemplate: '/${locale}/category/${entityId}',
    recordAnalytics: false,
  },
  Product: {
    pathTemplate: '/${locale}/product/${entityId}',
    recordAnalytics: true,
  },
  NormalPage: {
    pathTemplate: '/${locale}/webpages/${id}/normal/',
    recordAnalytics: false,
  },
  ContactPage: {
    pathTemplate: '/${locale}/webpages/${id}/contact/',
    recordAnalytics: false,
  },
  Blog: {
    pathTemplate: '/${locale}/blog',
    recordAnalytics: false,
  },
  BlogPost: {
    pathTemplate: '/${locale}/blog/${entityId}',
    recordAnalytics: false,
  },
};

export const DEFAULT_REDIRECT_CONFIG: RedirectConfig = {
  enabled: true,
  statusCode: 301,
  preserveTrailingSlash: true,
};

export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  routeCacheTtl: 30 * 60 * 1000, // 30 minutes
  statusCacheTtl: 5 * 60 * 1000,  // 5 minutes
};

export const DEFAULT_ANALYTICS_CONFIG: AnalyticsConfig = {
  enabled: true, // Enable by default for backward compatibility
};

export const DEFAULT_EXEMPT_ROUTES: string[] = [];

// Internal utility functions (not exported)
const generateCacheKey = (key: string, channelId?: string): string => {
  const VERSION = 'v3';
  const namespace = process.env.KV_NAMESPACE ?? process.env.BIGCOMMERCE_STORE_HASH ?? 'store';
  const id = channelId ?? process.env.BIGCOMMERCE_CHANNEL_ID ?? '1';

  return `${namespace}_${id}_${VERSION}_${key}`;
};

const clearLocaleFromPath = (path: string, locale: string): string => {
  if (path === `/${locale}` || path === `/${locale}/`) {
    return '/';
  }

  if (path.startsWith(`/${locale}/`)) {
    return path.replace(`/${locale}`, '');
  }

  return path;
};

export { generateCacheKey, clearLocaleFromPath };