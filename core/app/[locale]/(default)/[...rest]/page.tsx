import { Page as MakeswiftPage } from '@makeswift/runtime/next';
import { getSiteVersion } from '@makeswift/runtime/next/server';
import { notFound } from 'next/navigation';

import { defaultLocale, locales } from '~/i18n/routing';
import { client } from '~/lib/makeswift/client';

export async function generateStaticParams() {
  const pages = await client.getPages().toArray();

  return pages
    .filter((page) => page.path !== '/')
    .flatMap((page) =>
      locales.map((locale) => ({
        rest: page.path.split('/').filter((segment) => segment !== ''),
        locale: locale === defaultLocale ? undefined : locale,
      })),
    );
}

interface Props {
  params: Promise<{
    locale: string;
    rest: string[];
  }>;
}

export default async function CatchAllPage({ params }: Props) {
  const { rest, locale } = await params;
  const path = `/${rest.join('/')}`;

  const snapshot = await client.getPageSnapshot(path, {
    siteVersion: await getSiteVersion(),
    locale: locale === defaultLocale ? undefined : locale,
  });

  if (snapshot == null) return notFound();

  return <MakeswiftPage snapshot={snapshot} />;
}

export const runtime = 'nodejs';
