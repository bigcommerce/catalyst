import { locales } from '~/i18n/routing';
import { client, Page } from '~/lib/makeswift';

interface PageParams {
  locale: string;
  rest: string[];
}

export async function generateStaticParams(): Promise<PageParams[]> {
  const pages = await client.getPages().toArray();

  return pages.filter((page) => page.path !== '/').flatMap((page) => localesFanOut(page.path));
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
