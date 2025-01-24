import { getLocale } from 'next-intl/server';
import { strict } from 'assert';
import { Makeswift } from '@makeswift/runtime/next';

import { headers, draftMode, cookies } from 'next/headers';

import { runtime } from '~/lib/makeswift/runtime';

import { defaultLocale } from '~/i18n/routing';

import { z } from 'zod';

strict(process.env.MAKESWIFT_SITE_API_KEY, 'MAKESWIFT_SITE_API_KEY is required');

export const client = new Makeswift(process.env.MAKESWIFT_SITE_API_KEY, {
  runtime,
  apiOrigin: process.env.MAKESWIFT_API_ORIGIN,
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

const makeswiftSiteVersionSchema = z.enum(['Live', 'Working']);
const MakeswiftSiteVersion = makeswiftSiteVersionSchema.Enum;
type MakeswiftSiteVersion = z.infer<typeof makeswiftSiteVersionSchema>;

export const MAKESWIFT_DRAFT_MODE_DATA_COOKIE = 'x-makeswift-draft-data';

export const makeswiftDraftDataSchema = z.object({
  makeswift: z.literal(true),
  siteVersion: makeswiftSiteVersionSchema,
});

export type MakeswiftDraftData = z.infer<typeof makeswiftDraftDataSchema>;

async function getDraftData(): Promise<MakeswiftDraftData | null> {
  const { isEnabled: isDraftModeEnabled } = await draftMode();
  if (!isDraftModeEnabled) return null;

  const allCookies = await cookies();
  const cookie = allCookies.get(MAKESWIFT_DRAFT_MODE_DATA_COOKIE);
  if (cookie == null) return null;

  const draftData = JSON.parse(cookie.value);
  const result = makeswiftDraftDataSchema.safeParse(draftData);

  if (result.success) return result.data;
  return null;
}

export async function getSiteVersion() {
  const apiKey = (await headers()).get('x-makeswift-draft-mode');
  if (apiKey === process.env.MAKESWIFT_SITE_API_KEY) {
    return MakeswiftSiteVersion.Working;
  }

  return (await getDraftData())?.siteVersion ?? MakeswiftSiteVersion.Live;
}
