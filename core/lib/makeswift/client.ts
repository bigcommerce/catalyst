import { Makeswift } from '@makeswift/runtime/next';
import { getSiteVersion } from '@makeswift/runtime/next/server';
import { strict } from 'assert';
import { getLocale } from 'next-intl/server';

import { defaultLocale } from '~/i18n/routing';
import { runtime } from '~/lib/makeswift/runtime';

strict(process.env.MAKESWIFT_SITE_API_KEY, 'MAKESWIFT_SITE_API_KEY is required');

export const client = new Makeswift(process.env.MAKESWIFT_SITE_API_KEY, {
  runtime,
  apiOrigin: process.env.MAKESWIFT_API_ORIGIN,
});

export const getComponentSnapshot = async (snapshotId: string) => {
  const locale = await getLocale();

  return await client.getComponentSnapshot(snapshotId, {
    locale: locale === defaultLocale ? undefined : locale,
    siteVersion: await getSiteVersion(),
  });
};
