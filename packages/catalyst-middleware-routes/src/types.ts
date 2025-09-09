export type MiddlewareFactory = (middleware: NextMiddleware) => NextMiddleware;
export type NextMiddleware = (request: any, event?: any) => any;

export interface RouteMapping {
  /** Path template for the route (e.g., "/${locale}/brand/${entityId}") */
  pathTemplate: string;
  /** Whether to record analytics for this route type */
  recordAnalytics?: boolean;
}

export interface RouteMappings {
  Brand?: RouteMapping;
  Category?: RouteMapping;
  Product?: RouteMapping;
  NormalPage?: RouteMapping;
  ContactPage?: RouteMapping;
  RawHtmlPage?: RouteMapping;
  Blog?: RouteMapping;
  BlogPost?: RouteMapping;
}

export interface RedirectConfig {
  /** Whether redirects are enabled */
  enabled: boolean;
  /** HTTP status code for redirects */
  statusCode: 301 | 302 | 307 | 308;
  /** Whether to preserve trailing slashes in redirects */
  preserveTrailingSlash: boolean;
}

export interface CacheConfig {
  /** Route cache TTL in milliseconds */
  routeCacheTtl: number;
  /** Store status cache TTL in milliseconds */
  statusCacheTtl: number;
}

export interface KVAdapter {
  get<Data>(key: string): Promise<Data | null>;
  mget<Data>(...keys: string[]): Promise<(Data | null)[]>;
  set<Data>(key: string, value: Data, opts?: SetCommandOptions): Promise<Data>;
}

export interface SetCommandOptions {
  ttl?: number;
}

export interface AnalyticsConfig {
  /** Whether analytics are enabled */
  enabled: boolean;
}

export interface RoutesMiddlewareConfig {
  /** 
   * BigCommerce GraphQL client instance (REQUIRED)
   */
  client: any;

  /** 
   * KV adapter for caching routes and store status 
   * Defaults to memory-based caching
   */
  kvAdapter?: KVAdapter;

  /** 
   * Custom route mappings for different node types 
   */
  routeMappings?: RouteMappings;

  /** 
   * Redirect configuration 
   */
  redirects?: Partial<RedirectConfig>;

  /** 
   * Cache configuration 
   */
  cache?: Partial<CacheConfig>;

  /** 
   * Analytics configuration
   * Defaults to enabled
   */
  analytics?: Partial<AnalyticsConfig>;

  /** 
   * Top-level routes to exempt from middleware processing 
   * These routes will fall through to normal Next.js routing
   */
  exemptRoutes?: string[];
}

export interface Route {
  redirect?: {
    to: {
      __typename: string;
      path?: string;
      url?: string;
    };
    fromPath: string;
    toUrl: string;
  } | null;
  node?: {
    __typename: string;
    id?: string;
    entityId?: number;
  } | null;
}

export type StorefrontStatus = 'HIBERNATION' | 'LAUNCHED' | 'MAINTENANCE' | 'PRE_LAUNCH';

export interface RouteCache {
  route: Route | null;
  expiryTime: number;
}

export interface StorefrontStatusCache {
  status: StorefrontStatus;
  expiryTime: number;
}