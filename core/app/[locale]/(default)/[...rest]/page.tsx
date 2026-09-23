import { Metadata } from 'next';

import { getMakeswiftPageMetadata, Page } from '~/lib/makeswift';

interface PageParams {
  locale: string;
  rest: string[];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { rest, locale } = await params;
  const path = `/${rest.join('/')}`;

  const metadata = await getMakeswiftPageMetadata({ path, locale });

  return metadata ?? {};
}

// Intentionally no `generateStaticParams`: the locale list is resolved at runtime now, and every
// route under `[locale]` already renders on demand because the tree reads cookies, so fanning
// Makeswift page paths out over locales would only reintroduce a build-time dependency on the
// locale list without prerendering anything.

export default async function CatchAllPage({ params }: { params: Promise<PageParams> }) {
  const { rest, locale } = await params;
  const path = `/${rest.join('/')}`;

  return <Page locale={locale} path={path} />;
}
