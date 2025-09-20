import { defaultLocale, locales } from '~/i18n/locales';
import { client, Page } from '~/lib/makeswift';

interface PageParams {
  locale: string;
  rest: string[];
}

export async function generateStaticParams(): Promise<PageParams[]> {
  const pages = await client.getPages().toArray();

  const params = pages
    .filter((page) => page.path !== '/')
    .flatMap((page) => localesFanOut(page.path));

  // Next.js requires providing at least one value in `generateStaticParams`.
  //
  // See https://github.com/vercel/next.js/pull/73933
  if (params.length === 0) {
    return [{ rest: ['dev', 'null'], locale: defaultLocale }];
  }

  return params;
}

export default async function CatchAllPage({ params }: { params: Promise<PageParams> }) {
  const { rest, locale } = await params;
  const path = `/${rest.join('/')}`;

  return <Page locale={locale} path={path} />;
}

function localesFanOut(path: string): PageParams[] {
  return locales.map((locale) => ({
    rest: path.split('/').filter((segment) => segment !== ''),
    locale,
  }));
}
