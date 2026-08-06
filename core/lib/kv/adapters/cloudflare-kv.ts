import { KvAdapter, SetCommandOptions } from '../types';

// Minimal structural view of the Workers KV binding — only the two methods
// this adapter calls. Declared here rather than imported from
// `@cloudflare/workers-types` so `core` stays free of Cloudflare-only type
// dependencies; the runtime packages are installed only for projects that opt
// into Commerce hosting.
export interface RoutesKvNamespace {
  get(key: string, type: 'json'): Promise<unknown>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

// The per-project KV namespace bound to the Worker by the deploy platform.
const ROUTES_KV_BINDING = 'CATALYST_ROUTES_KV';

// Workers KV entries are permanent unless written with an expiration, and
// nothing else in this system ever deletes a routing cache key. Cache keys
// include the query string (see `with-routes.ts`), so without a TTL a single
// crawler walking `?utm_*` permutations would grow a store's namespace — and
// its billable write volume — without bound, from unauthenticated requests.
//
// This is deliberately much longer than the *logical* freshness window that
// `with-routes.ts` enforces via the `expiryTime` it stores inside each value
// (30 minutes for routes, 5 for storefront status). Those two timers do
// different jobs: `expiryTime` decides when to revalidate, this decides when to
// garbage-collect. Setting them equal would delete each entry exactly as it
// went stale, turning every stale-while-revalidate hit — which serves instantly
// and refreshes in the background — into a hard miss that blocks on a GraphQL
// round trip. That would make the cache slower than leaving it uncapped.
const ROUTES_CACHE_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

// `getCloudflareContext()` from `@opennextjs/cloudflare` is, in sync mode,
// nothing more than a read of this global registry symbol — the OpenNext
// worker entrypoint sets it in production and `initOpenNextCloudflareForDev`
// sets it under `next dev`. Reading it directly gets us the identical value
// without importing the package.
//
// That matters, because `@opennextjs/cloudflare` is deliberately absent from
// core's package.json (the CLI injects it only when a project opts into
// Commerce hosting), and every way of importing it from here is worse:
//
//   - A static `import` breaks `next build` outright when it's missing.
//   - A dynamic `import('@opennextjs/cloudflare')` fails `next build`'s
//     TypeScript step ("Cannot find module ... or its corresponding type
//     declarations") on every non-Commerce project.
//   - Silencing that with an ambient `declare module` shadows the package's
//     real types when it IS installed, which breaks the
//     `.bigcommerce/open-next.config.ts` the CLI writes into the project (it
//     imports `defineCloudflareConfig` from the same specifier, and core's
//     tsconfig compiles it).
//
// Reading the symbol has none of those failure modes: on a non-Cloudflare
// runtime it is simply undefined.
//
// !! DRIFT WARNING !!
// This key is an internal detail of `@opennextjs/cloudflare`, not exported
// API. If a version bump changes it, this adapter silently returns null and
// every native-hosted store quietly downgrades to an in-process cache — no
// error, no signal. Whoever bumps `OPENNEXT_CLOUDFLARE_VERSION` in
// `packages/catalyst/src/cli/lib/commerce-hosting.ts` must re-verify this
// value. A contract test in `packages/catalyst` (the package that actually
// has `@opennextjs/cloudflare` installed) asserts the real
// `getCloudflareContext()` still reads this exact key, so a bump that breaks
// it fails CI instead of degrading production. See
// `packages/catalyst/src/cli/lib/cloudflare-context-symbol.spec.ts`.
export const CLOUDFLARE_CONTEXT_SYMBOL_KEY = '__cloudflare-context__';

const CLOUDFLARE_CONTEXT_SYMBOL = Symbol.for(CLOUDFLARE_CONTEXT_SYMBOL_KEY);

// Duck-type rather than check for mere presence. A merchant can define an env
// var literally named `CATALYST_ROUTES_KV`, which arrives as a plain string; a
// truthiness check would accept it and then throw on the first `.get()`.
// Narrowing on the methods we actually call lets `createKVAdapter` fall
// through to Upstash/Memory cleanly instead.
export function isRoutesKvNamespace(value: unknown): value is RoutesKvNamespace {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return (
    typeof Reflect.get(value, 'get') === 'function' &&
    typeof Reflect.get(value, 'put') === 'function'
  );
}

// Resolves the per-project routing cache namespace, or null on any runtime
// that isn't Cloudflare (no context global), any Cloudflare runtime where the
// binding wasn't provisioned, and the env-var collision case above.
export function getRoutesKvNamespace(): RoutesKvNamespace | null {
  const context: unknown = Reflect.get(globalThis, CLOUDFLARE_CONTEXT_SYMBOL);

  if (typeof context !== 'object' || context === null) {
    return null;
  }

  const env: unknown = Reflect.get(context, 'env');

  if (typeof env !== 'object' || env === null) {
    return null;
  }

  const binding: unknown = Reflect.get(env, ROUTES_KV_BINDING);

  return isRoutesKvNamespace(binding) ? binding : null;
}

export class CloudflareKvAdapter implements KvAdapter {
  constructor(private namespace: RoutesKvNamespace) {}

  async mget<Data>(...keys: string[]): Promise<Array<Data | null>> {
    this.logger(
      `MGET - Keys: ${keys.toString()} - Source: CLOUDFLARE_KV - Fetching ${keys.length} keys`,
    );

    // Workers KV has no multi-get, so fan out. Each `get` is guarded
    // individually — one unreachable key shouldn't blank the whole batch.
    return Promise.all(
      keys.map(async (key) => {
        try {
          const value = await this.namespace.get(key, 'json');

          if (value === null || value === undefined) {
            this.logger(`CLOUDFLARE_KV GET - Key: ${key} - Found: false`);

            return null;
          }

          this.logger(`CLOUDFLARE_KV GET - Key: ${key} - Found: true`);

          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          return value as Data;
        } catch (error) {
          this.logger(
            `CLOUDFLARE_KV GET ERROR - Key: ${key} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );

          return null;
        }
      }),
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async set<Data>(key: string, value: Data, _opts?: SetCommandOptions): Promise<Data | null> {
    this.logger(`SET - Key: ${key} - Setting in Cloudflare KV`);

    try {
      await this.namespace.put(key, JSON.stringify(value), {
        expirationTtl: ROUTES_CACHE_TTL_SECONDS,
      });
      this.logger(`CLOUDFLARE_KV SET - Key: ${key} - Success`);
    } catch (error) {
      this.logger(
        `CLOUDFLARE_KV SET ERROR - Key: ${key} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    return value;
  }

  private logger(message: string) {
    // Same gating as the main KV class and the Vercel Runtime Cache adapter.
    const loggingEnabled =
      (process.env.NODE_ENV !== 'production' && process.env.KV_LOGGER !== 'false') ||
      process.env.KV_LOGGER === 'true';

    if (loggingEnabled) {
      // eslint-disable-next-line no-console
      console.log(`[BigCommerce] Cloudflare KV ${message}`);
    }
  }
}
