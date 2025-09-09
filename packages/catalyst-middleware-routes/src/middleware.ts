// Types will be imported from Next.js at runtime
import { 
  RoutesMiddlewareConfig, 
  MiddlewareFactory, 
  Route, 
  RouteCache, 
  StorefrontStatusCache, 
  StorefrontStatus,
  KVAdapter,
  RouteMappings 
} from './types';
import { 
  DEFAULT_ROUTE_MAPPINGS, 
  DEFAULT_REDIRECT_CONFIG, 
  DEFAULT_CACHE_CONFIG, 
  DEFAULT_ANALYTICS_CONFIG,
  DEFAULT_EXEMPT_ROUTES,
  generateCacheKey,
  clearLocaleFromPath
} from './defaults';
import { KVWithMemoryFallback, MemoryKVAdapter } from './kv';
import { GET_ROUTE_QUERY, GET_STORE_STATUS_QUERY } from './queries';
import { RouteCacheSchema, StorefrontStatusCacheSchema } from './validation';
import { recordProductVisit } from './analytics';
import { getRawPageContent } from './raw-pages';

const STORE_STATUS_KEY = 'storeStatus';

export class RoutesMiddleware {
  private kv: KVAdapter;
  private routeMappings: RouteMappings;
  private redirectConfig: typeof DEFAULT_REDIRECT_CONFIG;
  private cacheConfig: typeof DEFAULT_CACHE_CONFIG;
  private analyticsConfig: typeof DEFAULT_ANALYTICS_CONFIG;
  private exemptRoutes: string[];

  constructor(private config: RoutesMiddlewareConfig) {
    // Initialize KV adapter
    this.kv = config.kvAdapter 
      ? new KVWithMemoryFallback(config.kvAdapter, { logger: process.env.NODE_ENV !== 'production' })
      : new KVWithMemoryFallback(new MemoryKVAdapter(), { logger: process.env.NODE_ENV !== 'production' });

    // Merge configuration with defaults
    this.routeMappings = { ...DEFAULT_ROUTE_MAPPINGS, ...config.routeMappings };
    this.redirectConfig = { ...DEFAULT_REDIRECT_CONFIG, ...config.redirects };
    this.cacheConfig = { ...DEFAULT_CACHE_CONFIG, ...config.cache };
    this.analyticsConfig = { ...DEFAULT_ANALYTICS_CONFIG, ...config.analytics };
    this.exemptRoutes = config.exemptRoutes || DEFAULT_EXEMPT_ROUTES;
  }

  private async getRoute(path: string, channelId?: string): Promise<Route | null> {
    const response = await this.config.client.fetch({
      document: GET_ROUTE_QUERY,
      variables: { path },
      fetchOptions: { next: { revalidate: 900 } }, // 15 minutes
      channelId,
    });

    return response.data.site.route;
  }

  private async getStoreStatus(channelId?: string): Promise<StorefrontStatus | undefined> {
    const response = await this.config.client.fetch({
      document: GET_STORE_STATUS_QUERY,
      fetchOptions: { next: { revalidate: 300 } }, // 5 minutes
      channelId,
    });

    return response.data.site.settings?.status;
  }

  private async getRawWebPageContent(id: string): Promise<{ htmlBody: string }> {
    return getRawPageContent(this.config.client, id);
  }

  private async updateRouteCache(
    pathname: string,
    channelId: string,
    event: any,
  ): Promise<RouteCache> {
    const routeCache: RouteCache = {
      route: await this.getRoute(pathname, channelId),
      expiryTime: Date.now() + this.cacheConfig.routeCacheTtl,
    };

    event.waitUntil(this.kv.set(generateCacheKey(pathname, channelId), routeCache));

    return routeCache;
  }

  private async updateStatusCache(
    channelId: string,
    event: any,
  ): Promise<StorefrontStatusCache> {
    const status = await this.getStoreStatus(channelId);

    if (status === undefined) {
      throw new Error('Failed to fetch new storefront status');
    }

    const statusCache: StorefrontStatusCache = {
      status,
      expiryTime: Date.now() + this.cacheConfig.statusCacheTtl,
    };

    event.waitUntil(this.kv.set(generateCacheKey(STORE_STATUS_KEY, channelId), statusCache));

    return statusCache;
  }

  private async getRouteInfo(request: any, event: any) {
    const locale = request.headers.get('x-bc-locale') ?? '';
    const channelId = request.headers.get('x-bc-channel-id') ?? '';

    try {
      // For route resolution parity, include query params for redirect matching
      const pathname = clearLocaleFromPath(
        request.nextUrl.pathname + request.nextUrl.search, 
        locale
      );

      const [routeCache, statusCache] = await this.kv.mget<RouteCache | StorefrontStatusCache>(
        generateCacheKey(pathname, channelId),
        generateCacheKey(STORE_STATUS_KEY, channelId),
      );

      // SWR-like behavior: update cache in background if expired, use immediately if missing
      let finalRouteCache = routeCache as RouteCache | null;
      let finalStatusCache = statusCache as StorefrontStatusCache | null;

      if (finalStatusCache && finalStatusCache.expiryTime < Date.now()) {
        event.waitUntil(this.updateStatusCache(channelId, event));
      } else if (!finalStatusCache) {
        finalStatusCache = await this.updateStatusCache(channelId, event);
      }

      if (finalRouteCache && finalRouteCache.expiryTime < Date.now()) {
        event.waitUntil(this.updateRouteCache(pathname, channelId, event));
      } else if (!finalRouteCache) {
        finalRouteCache = await this.updateRouteCache(pathname, channelId, event);
      }

      const parsedRoute = RouteCacheSchema.safeParse(finalRouteCache);
      const parsedStatus = StorefrontStatusCacheSchema.safeParse(finalStatusCache);

      return {
        route: parsedRoute.success ? parsedRoute.data.route : undefined,
        status: parsedStatus.success ? parsedStatus.data.status : undefined,
      };
    } catch (error) {
      console.error('[Catalyst Routes] Error getting route info:', error);
      return {
        route: undefined,
        status: undefined,
      };
    }
  }

  private isExemptRoute(pathname: string): boolean {
    return this.exemptRoutes.some(exemptRoute => {
      if (exemptRoute.endsWith('*')) {
        return pathname.startsWith(exemptRoute.slice(0, -1));
      }
      return pathname === exemptRoute || pathname.startsWith(exemptRoute + '/');
    });
  }

  private buildRouteUrl(nodeType: string, locale: string, data: any): string {
    const mapping = this.routeMappings[nodeType as keyof RouteMappings];
    
    if (!mapping) {
      return `/${locale}${data.fallbackPath || ''}`;
    }

    let url = mapping.pathTemplate;
    
    // Replace template variables
    url = url.replace('${locale}', locale);
    url = url.replace('${entityId}', data.entityId?.toString() || '');
    url = url.replace('${id}', data.id || '');

    return url;
  }

  public createMiddleware(): MiddlewareFactory {
    return () => {
      return async (request: any, event?: any) => {
        const { NextResponse } = await import('next/server');
        
        if (!event) {
          return NextResponse.next();
        }

        const locale = request.headers.get('x-bc-locale') ?? '';
        const pathname = request.nextUrl.pathname;

        // Check if route is exempted
        if (this.isExemptRoute(pathname)) {
          return NextResponse.next();
        }

        const { route, status } = await this.getRouteInfo(request, event);

        // Handle maintenance mode
        if (status === 'MAINTENANCE') {
          return NextResponse.rewrite(new URL(`/${locale}/maintenance`, request.url), { status: 503 });
        }

        // Handle redirects
        if (this.redirectConfig.enabled && route?.redirect) {
          const fromPathSearchParams = new URL(route.redirect.fromPath, request.url).search;
          const searchParams = fromPathSearchParams.length > 0 ? '' : request.nextUrl.search;

          const redirectConfig = {
            status: this.redirectConfig.statusCode,
            nextConfig: {
              trailingSlash: this.redirectConfig.preserveTrailingSlash,
            },
          };

          switch (route.redirect.to.__typename) {
            case 'BlogPostRedirect':
            case 'BrandRedirect':
            case 'CategoryRedirect':
            case 'PageRedirect':
            case 'ProductRedirect': {
              const redirectUrl = new URL(route.redirect.to.path! + searchParams, request.url);
              return NextResponse.redirect(redirectUrl, redirectConfig);
            }

            case 'ManualRedirect': {
              const redirectUrl = new URL(route.redirect.to.url!, request.url);

              if (redirectUrl.origin === request.nextUrl.origin) {
                redirectUrl.search = searchParams;
              }

              return NextResponse.redirect(redirectUrl, redirectConfig);
            }

            default: {
              return NextResponse.redirect(route.redirect.toUrl, redirectConfig);
            }
          }
        }

        // Handle route mapping
        const node = route?.node;
        let url: string;

        switch (node?.__typename) {
          case 'RawHtmlPage': {
            const { htmlBody } = await this.getRawWebPageContent(node.id!);
            return new NextResponse(htmlBody, {
              headers: { 'content-type': 'text/html' },
            });
          }

          case 'Product': {
            url = this.buildRouteUrl('Product', locale, node);
            
            // Record analytics if enabled
            const mapping = this.routeMappings.Product;
            if (mapping?.recordAnalytics && this.analyticsConfig.enabled) {
              event.waitUntil(recordProductVisit(this.config.client, request, node.entityId!));
            }
            break;
          }

          default: {
            if (node?.__typename) {
              url = this.buildRouteUrl(node.__typename, locale, node);
            } else {
              const cleanPathName = clearLocaleFromPath(pathname, locale);
              url = `/${locale}${cleanPathName}`;
            }
          }
        }

        const rewriteUrl = new URL(url!, request.url);
        rewriteUrl.search = request.nextUrl.search;

        return NextResponse.rewrite(rewriteUrl);
      };
    };
  }
}