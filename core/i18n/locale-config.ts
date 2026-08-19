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

// Set by `~/proxies/with-intl` so the render reuses what resolved the inbound URL.
export const LOCALE_ROUTING_HEADER = 'x-bc-locale-routing';

// Short, because merchants change subfolders without redeploying.
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

// Locale routing is one URL space for the whole deployment, so per-locale channel overrides
// (`~/channels.config`) must not change it.
const defaultChannelId = () => process.env.BIGCOMMERCE_CHANNEL_ID;

// Also guards untrusted input (KV contents, the forwarded header): `//` would allow a
// protocol-relative redirect off-site, `..` would allow traversal.
const LOCALE_PREFIX_PATTERN = /^(\/[^/\\]+)+$/;

const LocalePrefixSchema = z.custom<`/${string}`>(
  (prefix) =>
    typeof prefix === 'string' &&
    LOCALE_PREFIX_PATTERN.test(prefix) &&
    !prefix.split('/').includes('..'),
  { message: 'Locale prefix must be one or more "/"-separated path segments' },
);

// Codes reach URLs too — next-intl falls back to `/<code>` when no subfolder is set.
const LocaleCodeSchema = z.string().regex(/^[A-Za-z0-9_-]+$/, {
  message: 'Locale code must contain only letters, digits, hyphens or underscores',
});

const LocaleRoutingSchema = z.object({
  locales: z.array(LocaleCodeSchema).min(1),
  defaultLocale: LocaleCodeSchema,
  prefixes: z.record(LocaleCodeSchema, LocalePrefixSchema),
  rootLocale: LocaleCodeSchema.nullable(),
});

const isUsableLocaleNode = (localeNode: LocaleNode): boolean => {
  if (!LocaleCodeSchema.safeParse(localeNode.code).success) {
    return false;
  }

  const path = normalizeLocalePath(localeNode.path);

  // No subfolder is valid: the locale sits at "/" or falls back to its bare code.
  return path === '' || LocalePrefixSchema.safeParse(`/${path}`).success;
};

const fetchLocaleRouting = async (): Promise<LocaleRouting> => {
  const { data } = await client.fetch({
    document: LocaleSettingsQuery,
    // Best effort: `fetch` isn't patched in the proxy runtime, and the Data Cache doesn't dedupe
    // these POSTs across requests. Both callers below cache for themselves.
    fetchOptions: { next: { revalidate: LOCALE_CONFIG_TTL_SECONDS } },
    channelId: defaultChannelId(),
  });

  const localeNodes = data.site.settings?.locales;

  if (!localeNodes?.length) {
    throw new Error('No locales returned from BigCommerce site settings');
  }

  // Screened per locale so one unusable row costs that locale, not the storefront. Screening here
  // also means anything cached will pass the same check on the way back out.
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

  // Expiry lives in the value because the KV adapters either ignore TTL options or never enforce
  // them on read, as in `~/proxies/with-routes`.
  event.waitUntil(kv.set(kvKey(LOCALE_CONFIG_KEY), localeConfigCache));

  return localeConfigCache;
};

// Never throws: a miss, an unreadable entry and an unavailable KV all mean "no cache", so the
// caller refetches. Losing the cache must not take the storefront down.
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
 * Locale routing for the proxy, KV-cached stale-while-revalidate as in `~/proxies/with-routes`.
 *
 * @param {NextFetchEvent} event - Proxy fetch event, used to write to KV off the response path.
 * @returns {Promise<LocaleRouting | null>} `null` only when there is no usable cache *and*
 *   BigCommerce is unreachable, leaving the URL space unknown.
 */
export const getLocaleRoutingForProxy = async (
  event: NextFetchEvent,
): Promise<LocaleRouting | null> => {
  // Read outside the try: a cache failure is recoverable by fetching, so it must not short-circuit
  // to `null` and take every request down with it.
  const localeConfigCache = await readLocaleConfigCache();

  try {
    if (!localeConfigCache) {
      return (await updateLocaleConfigCache(event)).routing;
    }

    if (localeConfigCache.expiryTime < Date.now()) {
      // The cached value is served either way, so this must not become an unhandled rejection.
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
 * The routing the proxy resolved for this request. Header-only, no I/O, so it is safe to call from
 * `~/i18n/request`, where fetching would recurse via `client.fetch` -> `getLocale()`.
 *
 * @returns {Promise<LocaleRouting | null>} `null` when absent or invalid.
 */
export const getForwardedLocaleRouting = async (): Promise<LocaleRouting | null> => {
  const forwarded = (await headers()).get(LOCALE_ROUTING_HEADER);

  if (!forwarded) {
    return null;
  }

  const parsedHeader = LocaleRoutingSchema.safeParse(parseJson(forwarded));

  return parsedHeader.success ? parsedHeader.data : null;
};

// Locale routing for rendering and redirects. Prefers what the proxy resolved, so outbound URLs
// can't disagree with the inbound one. Throws rather than invent prefixes that resolve nowhere.
export const getLocaleRouting = cache(async (): Promise<LocaleRouting> => {
  return (await getForwardedLocaleRouting()) ?? (await fetchLocaleRouting());
});
