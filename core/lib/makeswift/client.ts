import { type MakeswiftClient } from '@makeswift/runtime/client';
import { Makeswift } from '@makeswift/runtime/next';
import { getSiteVersion } from '@makeswift/runtime/next/server';
import { strict } from 'assert';
import { getLocale } from 'next-intl/server';

import { defaultLocale } from '~/i18n/locales';

import { runtime } from './runtime';

strict(process.env.MAKESWIFT_SITE_API_KEY, 'MAKESWIFT_SITE_API_KEY is required');

// `Makeswift` narrows this to a non-null site version, but the client passes `null` for the
// published site.
type SiteVersionArg = Parameters<MakeswiftClient['fetchOptions']>[0];

// Makeswift tags its API responses but declares no revalidate window, and
// `app/[locale]/layout.tsx` sets `fetchCache = 'default-cache'`, so without a TTL Next.js
// caches them indefinitely. In production the publish webhook revalidates the `@@makeswift`
// tag, making this only a backstop; it stays long because time-based expiry serves the
// previous response to the request that triggers the refresh. Makeswift cannot reach a local
// dev server, where the TTL is the only invalidation, so development defaults to 0.
const MAKESWIFT_REVALIDATE_TARGET = resolveRevalidateTarget();

function resolveRevalidateTarget(): number {
  const override = process.env.MAKESWIFT_REVALIDATE_TARGET;

  if (override) {
    return Number(override);
  }

  return process.env.NODE_ENV === 'development' ? 0 : 3600;
}

class CatalystMakeswift extends Makeswift {
  fetchOptions(siteVersion: SiteVersionArg): Record<string, unknown> {
    // The base implementation ignores this argument despite typing it as required.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const options = super.fetchOptions(siteVersion!);

    // Draft mode already sets `cache: 'no-store'`; pairing that with `revalidate` makes
    // Next.js discard both and fall back to caching the builder's edits indefinitely.
    if (siteVersion != null) {
      return options;
    }

    const { next } = options;

    return {
      ...options,
      next: {
        ...(typeof next === 'object' && next !== null ? next : {}),
        revalidate: MAKESWIFT_REVALIDATE_TARGET,
      },
    };
  }
}

export const client = new CatalystMakeswift(process.env.MAKESWIFT_SITE_API_KEY, {
  runtime,
});

export const getPageSnapshot = async ({ path, locale }: { path: string; locale: string }) =>
  await client.getPageSnapshot(path, {
    siteVersion: await getSiteVersion(),
    locale: normalizeLocale(locale),
  });

export const getComponentSnapshot = async (snapshotId: string) => {
  const locale = await getLocale();

  return await client.getComponentSnapshot(snapshotId, {
    siteVersion: await getSiteVersion(),
    locale: normalizeLocale(locale),
  });
};

function normalizeLocale(locale: string): string | undefined {
  return locale === defaultLocale ? undefined : locale;
}

export async function getMakeswiftPageMetadata({ path, locale }: { path: string; locale: string }) {
  const { data: pages } = await client.getPages({
    pathPrefix: path,
    locale: normalizeLocale(locale),
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
