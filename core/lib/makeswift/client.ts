import { Makeswift } from '@makeswift/runtime/next';
import { getSiteVersion } from '@makeswift/runtime/next/server';
import { strict } from 'assert';
import { getLocale } from 'next-intl/server';

import { defaultLocale } from '~/i18n/locales';

import { runtime } from './runtime';

strict(process.env.MAKESWIFT_SITE_API_KEY, 'MAKESWIFT_SITE_API_KEY is required');

export const client = new Makeswift(process.env.MAKESWIFT_SITE_API_KEY, {
  runtime,
  apiOrigin: process.env.NEXT_PUBLIC_MAKESWIFT_API_ORIGIN ?? process.env.MAKESWIFT_API_ORIGIN,
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
