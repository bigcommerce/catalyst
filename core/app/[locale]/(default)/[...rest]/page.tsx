import { Page as MakeswiftPage } from '@makeswift/runtime/next';
import { getSiteVersion } from '@makeswift/runtime/next/server';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';

import { defaultLocale, locales } from '~/i18n/routing';
import { client } from '~/lib/makeswift/client';
import { MakeswiftProvider } from '~/lib/makeswift/provider';

interface CatchAllParams {
  locale: string;
  rest: string[];
}

export async function generateStaticParams() {
  const pages = await client.getPages().toArray();

  return pages
    .filter((page) => page.path !== '/')
    .flatMap((page) =>
      locales.map((locale) => ({
        rest: page.path.split('/').filter((segment) => segment !== ''),
        // Remove eslint disable once more locales are added
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        locale: locale === defaultLocale ? undefined : locale,
      })),
    );
}

export default async function CatchAllPage({ params }: { params: CatchAllParams }) {
  const path = `/${params.rest.join('/')}`;

  const snapshot = await client.getPageSnapshot(path, {
    siteVersion: getSiteVersion(),
    locale: params.locale === defaultLocale ? undefined : params.locale,
  });

  if (snapshot == null) return notFound();

  return (
    <MakeswiftProvider previewMode={await draftMode().isEnabled}>
      <MakeswiftPage snapshot={snapshot} />
    </MakeswiftProvider>
  );
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
