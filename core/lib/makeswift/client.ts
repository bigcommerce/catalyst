import { Makeswift, type SiteVersion } from '@makeswift/runtime/next';
import { getSiteVersion } from '@makeswift/runtime/next/server';
import { strict } from 'assert';
import { unstable_cache } from 'next/cache';
import { getLocale } from 'next-intl/server';
import { AsyncLocalStorage } from 'node:async_hooks';

import { getLocaleRouting } from '~/i18n/locale-config';

import { runtime } from './runtime';

strict(process.env.MAKESWIFT_SITE_API_KEY, 'MAKESWIFT_SITE_API_KEY is required');

export const client = new Makeswift(process.env.MAKESWIFT_SITE_API_KEY, {
  runtime,
});

// The tag the Makeswift publish webhook revalidates; `@makeswift/runtime` doesn't export it.
const MAKESWIFT_CACHE_TAG = '@@makeswift';

// Next.js only caches 200 responses, so without this every unknown path (e.g. bot probes) costs
// an uncached Makeswift API call. Found results are still served by the regular cached fetches.
const NOT_FOUND_CACHE_OPTIONS = { tags: [MAKESWIFT_CACHE_TAG], revalidate: 300 };

function cacheNotFound<Args extends Array<string | undefined>>(
  key: string,
  isMissing: (...args: Args) => Promise<boolean>,
) {
  return (...args: Args) => {
    // `unstable_cache` disables fetch caching inside its callback, so run the lookup in the
    // caller's context to keep found snapshots served from (and stored in) the Data Cache.
    const runInCallerContext = AsyncLocalStorage.snapshot();

    return unstable_cache(
      (...cacheArgs: Args) => runInCallerContext(() => isMissing(...cacheArgs)),
      [key],
      NOT_FOUND_CACHE_OPTIONS,
    )(...args);
  };
}

const isPageMissing = cacheNotFound(
  'makeswift-page-missing',
  async (path: string, locale: string | undefined) =>
    (await client.getPageSnapshot(path, { siteVersion: null, locale })) == null,
);

const isComponentLocaleMissing = cacheNotFound(
  'makeswift-component-locale-missing',
  async (snapshotId: string, locale: string) => {
    try {
      await client.getComponentSnapshot(snapshotId, { siteVersion: null, locale });

      return false;
    } catch (error) {
      if (isNotFoundError(error)) {
        return true;
      }

      throw error;
    }
  },
);

// Draft mode (the builder) must see new pages immediately, and Makeswift can't reach a local dev
// server to revalidate.
function canCacheNotFound(siteVersion: SiteVersion | null): boolean {
  return siteVersion == null && process.env.NODE_ENV !== 'development';
}

export const getPageSnapshot = async ({ path, locale }: { path: string; locale: string }) => {
  const siteVersion = await getSiteVersion();
  const normalizedLocale = await normalizeLocale(locale);

  if (canCacheNotFound(siteVersion) && (await isPageMissing(path, normalizedLocale))) {
    return null;
  }

  return await client.getPageSnapshot(path, { siteVersion, locale: normalizedLocale });
};

export const getComponentSnapshot = async (snapshotId: string) => {
  const siteVersion = await getSiteVersion();
  const locale = await normalizeLocale(await getLocale());

  if (
    locale !== undefined &&
    canCacheNotFound(siteVersion) &&
    (await isComponentLocaleMissing(snapshotId, locale))
  ) {
    return await client.getComponentSnapshot(snapshotId, { siteVersion, locale: undefined });
  }

  try {
    return await client.getComponentSnapshot(snapshotId, { siteVersion, locale });
  } catch (error) {
    // Makeswift 404s component snapshots for a locale the site hasn't added, so fall back to
    // the default locale's content.
    if (locale !== undefined && isNotFoundError(error)) {
      return await client.getComponentSnapshot(snapshotId, { siteVersion, locale: undefined });
    }

    throw error;
  }
};

// `RestApiClientError` isn't exported by `@makeswift/runtime`.
function isNotFoundError(error: unknown): boolean {
  return error instanceof Error && 'status' in error && error.status === 404;
}

async function normalizeLocale(locale: string): Promise<string | undefined> {
  const { defaultLocale } = await getLocaleRouting();

  return locale === defaultLocale ? undefined : locale;
}

export async function getMakeswiftPageMetadata({ path, locale }: { path: string; locale: string }) {
  const { data: pages } = await client.getPages({
    pathPrefix: path,
    locale: await normalizeLocale(locale),
    siteVersion: await getSiteVersion(),
  });

  if (pages.length === 0 || !pages[0]) {
    return null;
  }

  const { title, description } = pages[0];

  return {
    ...(title && { title }),
    ...(description && { description }),
  };
}
