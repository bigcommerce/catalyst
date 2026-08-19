import { headers } from 'next/headers';
import { NextFetchEvent } from 'next/server';
import { cache } from 'react';
import { z } from 'zod';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { kv } from '~/lib/kv';
import { kvKey, LOCALE_CONFIG_KEY } from '~/lib/kv/keys';

import {
  deriveLocaleRouting,
  LocaleNode,
  LocaleRouting,
  normalizeLocalePath,
} from './locale-routing';

/**
 * Header used by `~/proxies/with-intl` to hand the locale routing it resolved for this request down
 * to the render, so both sides are guaranteed to agree and the render costs no extra round trip.
 */
export const LOCALE_ROUTING_HEADER = 'x-bc-locale-routing';

// Merchants change locale subfolders in the control panel without redeploying, so this is kept
// short.
const LOCALE_CONFIG_TTL_SECONDS = 300;
const LOCALE_CONFIG_TTL_MS = LOCALE_CONFIG_TTL_SECONDS * 1000;

const LocaleSettingsQuery = graphql(`
  query LocaleSettingsQuery {
    site {
      settings {
        locales {
          code
          isDefault
          path
        }
      }
    }
  }
`);

// Locale routing defines a single URL space for the whole deployment, so it is always read from
// the default channel. Per-locale channel overrides (`~/channels.config`) must not change the
// shape of the URLs used to reach them. This also matches the build-time fetch in next.config.ts.
const defaultChannelId = () => process.env.BIGCOMMERCE_CHANNEL_ID;

// One or more non-empty path segments. Deliberately permissive about the characters merchants may
// use, but strict about shape: this schema also guards values read back from KV, so rejecting `//`
// stops a protocol-relative prefix from turning a localized redirect into an off-site one, and
// rejecting `..` stops traversal.
const LOCALE_PREFIX_PATTERN = /^(\/[^/\\]+)+$/;

const LocalePrefixSchema = z.custom<`/${string}`>(
  (prefix) =>
    typeof prefix === 'string' &&
    LOCALE_PREFIX_PATTERN.test(prefix) &&
    !prefix.split('/').includes('..'),
  { message: 'Locale prefix must be one or more "/"-separated path segments' },
);

// Locale codes end up in URLs (next-intl falls back to `/<code>` when no subfolder is set), so they
// are constrained to the same safe shape.
const LocaleCodeSchema = z.string().regex(/^[A-Za-z0-9_-]+$/, {
  message: 'Locale code must contain only letters, digits, hyphens or underscores',
});

const LocaleRoutingSchema = z.object({
  locales: z.array(LocaleCodeSchema).min(1),
  defaultLocale: LocaleCodeSchema,
  prefixes: z.record(LocaleCodeSchema, LocalePrefixSchema),
  rootLocale: LocaleCodeSchema.nullable(),
});

// A locale is usable when its code and (normalized) subfolder can both be expressed in a URL.
const isUsableLocaleNode = (localeNode: LocaleNode): boolean => {
  if (!LocaleCodeSchema.safeParse(localeNode.code).success) {
    return false;
  }

  const path = normalizeLocalePath(localeNode.path);

  // No subfolder is valid — the locale is either served at "/" or falls back to its bare code.
  return path === '' || LocalePrefixSchema.safeParse(`/${path}`).success;
};

const fetchLocaleRouting = async (): Promise<LocaleRouting> => {
  const { data } = await client.fetch({
    document: LocaleSettingsQuery,
    // Best effort only: `fetch` is not patched in the proxy runtime, and in practice the Data Cache
    // does not dedupe these POSTs across requests either. Both callers below therefore do their own
    // caching — KV in the proxy, and the forwarded request header when rendering.
    fetchOptions: { next: { revalidate: LOCALE_CONFIG_TTL_SECONDS } },
    channelId: defaultChannelId(),
  });

  const localeNodes = data.site.settings?.locales;

  // Throwing keeps an empty result out of the cache. Caching it would make every localized URL a
  // 404 for the full TTL, which is worse than failing the request and retrying.
  if (!localeNodes?.length) {
    throw new Error('No locales returned from BigCommerce site settings');
  }

  // Screened per locale, not all-or-nothing: a single unusable row should cost that one locale, not
  // the whole storefront. Screening here also means whatever gets cached is guaranteed to pass the
  // same check on the way back out, so a rejected value can't silently turn the cache into a
  // per-request refetch.
  const usableLocaleNodes = localeNodes.filter((localeNode) => {
    if (isUsableLocaleNode(localeNode)) {
      return true;
    }

    // eslint-disable-next-line no-console
    console.error(
      `Ignoring locale "${localeNode.code}": its configured subfolder ${JSON.stringify(
        localeNode.path,
      )} cannot be used in a URL.`,
    );

    return false;
  });

  if (!usableLocaleNodes.length) {
    throw new Error('No usable locales in the BigCommerce site settings');
  }

  const parsedLocaleRouting = LocaleRoutingSchema.safeParse(deriveLocaleRouting(usableLocaleNodes));

  if (!parsedLocaleRouting.success) {
    throw new Error(
      `Unusable locale configuration from BigCommerce: ${parsedLocaleRouting.error.message}`,
    );
  }

  return parsedLocaleRouting.data;
};

const LocaleConfigCacheSchema = z.object({
  routing: LocaleRoutingSchema,
  expiryTime: z.number(),
});

interface LocaleConfigCache {
  routing: LocaleRouting;
  expiryTime: number;
}

const updateLocaleConfigCache = async (event: NextFetchEvent): Promise<LocaleConfigCache> => {
  const localeConfigCache: LocaleConfigCache = {
    routing: await fetchLocaleRouting(),
    expiryTime: Date.now() + LOCALE_CONFIG_TTL_MS,
  };

  // The KV adapters either ignore TTL options entirely (Vercel Runtime Cache) or never enforce
  // them on read (memory), so expiry is carried inside the value, as in `~/proxies/with-routes`.
  event.waitUntil(kv.set(kvKey(LOCALE_CONFIG_KEY), localeConfigCache));

  return localeConfigCache;
};

// Always resolves. A miss, an unreadable entry, or an unavailable KV all report "no cache", so the
// caller refetches instead of failing — losing the cache must not take the storefront down.
const readLocaleConfigCache = async (): Promise<LocaleConfigCache | null> => {
  try {
    const cached = await kv.get<LocaleConfigCache>(kvKey(LOCALE_CONFIG_KEY));

    if (cached === null) {
      return null;
    }

    const parsedLocaleConfig = LocaleConfigCacheSchema.safeParse(cached);

    if (!parsedLocaleConfig.success) {
      // eslint-disable-next-line no-console
      console.error(
        'Discarding unreadable cached locale configuration',
        parsedLocaleConfig.error.message,
      );

      return null;
    }

    return parsedLocaleConfig.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Unable to read cached locale configuration', error);

    return null;
  }
};

/**
 * Resolves the merchant's locale routing for use in the proxy.
 *
 * `fetch` is not cached in the proxy runtime, so this uses KV with the same stale-while-revalidate
 * shape as `~/proxies/with-routes`: stale entries are served immediately and refreshed in the
 * background, and a miss blocks once.
 *
 * Returns `null` only when the configuration cannot be resolved at all — no usable cache *and* an
 * unreachable BigCommerce. There is no build-time snapshot to fall back on, because one would be
 * just as likely to be wrong as missing; the caller decides how to fail.
 *
 * @param {NextFetchEvent} event - The proxy fetch event, used to write to KV without blocking the response.
 * @returns {Promise<LocaleRouting | null>} The merchant's locale routing, or `null` if unresolvable.
 */
export const getLocaleRoutingForProxy = async (
  event: NextFetchEvent,
): Promise<LocaleRouting | null> => {
  // Outside the try: a cache failure is recoverable by fetching, so it must not short-circuit to
  // `null` and take every request down with it.
  const localeConfigCache = await readLocaleConfigCache();

  try {
    if (!localeConfigCache) {
      return (await updateLocaleConfigCache(event)).routing;
    }

    if (localeConfigCache.expiryTime < Date.now()) {
      // Background refresh: the cached value is served either way, so a failure here must not become
      // an unhandled rejection on every request while BigCommerce is unreachable.
      event.waitUntil(
        updateLocaleConfigCache(event).catch((error: unknown) => {
          // eslint-disable-next-line no-console
          console.error('Background refresh of locale configuration failed', error);
        }),
      );
    }

    return localeConfigCache.routing;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Unable to resolve locale configuration from BigCommerce', error);

    return null;
  }
};

const parseJson = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
};

/**
 * The locale routing `~/proxies/with-intl` resolved for this request, if the request went through
 * the proxy. Reads a header only — no I/O — so it is safe to call from anywhere on the server,
 * including `~/i18n/request`, where triggering a GraphQL fetch would recurse back through
 * `client.fetch` -> `getLocale()` -> this request config.
 *
 * @returns {Promise<LocaleRouting | null>} The forwarded routing, or `null` if not present or invalid.
 */
export const getForwardedLocaleRouting = async (): Promise<LocaleRouting | null> => {
  const forwarded = (await headers()).get(LOCALE_ROUTING_HEADER);

  if (!forwarded) {
    return null;
  }

  const parsedHeader = LocaleRoutingSchema.safeParse(parseJson(forwarded));

  return parsedHeader.success ? parsedHeader.data : null;
};

/**
 * Locale routing for server-side rendering and redirects.
 *
 * Prefers the routing the proxy already resolved for this request. That makes the render and the
 * proxy incapable of disagreeing — outbound URLs are built from exactly the configuration that
 * resolved the inbound one — and costs no round trip.
 *
 * Falls back to fetching for the paths the proxy matcher excludes (`/admin`, `/xmlsitemap.php`).
 * Wrapped in `React.cache` so that fetch runs at most once per render.
 *
 * Throws if the configuration cannot be resolved. Without it there is no way to know the store's URL
 * space, so failing is preferable to inventing prefixes and serving URLs that resolve nowhere.
 *
 * @returns {Promise<LocaleRouting>} Locale routing for the current request.
 */
export const getLocaleRouting = cache(async (): Promise<LocaleRouting> => {
  return (await getForwardedLocaleRouting()) ?? (await fetchLocaleRouting());
});
