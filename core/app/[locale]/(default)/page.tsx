import { Page as MakeswiftPage } from '@makeswift/runtime/next';
import { getSiteVersion } from '@makeswift/runtime/next/server';
import { notFound } from 'next/navigation';

import { defaultLocale } from '~/i18n/routing';
import { client } from '~/lib/makeswift/client';
import '~/lib/makeswift/components';

interface Props {
  params: {
    locale: string;
  };
}

export default async function Home(props : Props) {
  const params = await props.params;
  const { locale } = params;
  const snapshot = await client.getPageSnapshot('/', {
    siteVersion: await getSiteVersion(),
    locale: locale === defaultLocale ? undefined : locale,
  });

  if (snapshot == null) return notFound();

  return <MakeswiftPage snapshot={snapshot} />;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
