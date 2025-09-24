'use server';

import { getSiteVersion } from '@makeswift/runtime/next/server';

import { defaultLocale } from '~/i18n/locales';
import { client as makeswiftClient } from '~/lib/makeswift/client';

const getPageInfo = async ({
  pathname,
  locale,
}: {
  pathname: string;
  locale: string | undefined;
}) =>
  makeswiftClient
    .getPages({
      locale: locale === defaultLocale ? undefined : locale,
      pathPrefix: pathname,
      siteVersion: await getSiteVersion(),
    })
    .filter((page) => page.path === pathname)
    .toArray()
    .then((pages) => (pages.length === 0 ? null : pages[0]));

const getPathname = (variants: Array<{ locale: string; path: string }>, locale: string) =>
  variants.find((v) => v.locale === locale)?.path;

export async function getLocalizedPathname({
  pathname,
  activeLocale,
  targetLocale,
}: {
  pathname: string;
  activeLocale: string | undefined;
  targetLocale: string;
}) {
  // fallback to page info for default locale if there is no page info for active locale
  const fallbackPageInfo =
    activeLocale === defaultLocale
      ? Promise.resolve(null)
      : getPageInfo({ pathname, locale: undefined });

  const localizedPageInfo = await getPageInfo({ pathname, locale: activeLocale });
  const pageInfo = localizedPageInfo ?? (await fallbackPageInfo);

  if (pageInfo == null) {
    return pathname;
  }

  return (
    getPathname(pageInfo.localizedVariants, targetLocale) ??
    getPathname(pageInfo.localizedVariants, defaultLocale) ??
    pathname
  );
}
