import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cache } from 'react';

import { Streamable } from '@/vibes/soul/lib/streamable';
import { Breadcrumb } from '@/vibes/soul/sections/breadcrumbs';
import {
  breadcrumbsTransformer,
  truncateBreadcrumbs,
} from '~/data-transformers/breadcrumbs-transformer';
import { getMakeswiftPageMetadata } from '~/lib/makeswift';
import { getMetadataAlternates } from '~/lib/seo/canonical';

import { WebPageContent, WebPage as WebPageData } from '../_components/web-page';

import { getWebpageData } from './page-data';

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

const getWebPage = cache(async (id: string): Promise<WebPageData> => {
  const data = await getWebpageData({ id: decodeURIComponent(id) });
  const webpage = data.node?.__typename === 'NormalPage' ? data.node : null;

  if (!webpage) {
    return notFound();
  }

  const breadcrumbs = breadcrumbsTransformer(webpage.breadcrumbs);

  return {
    title: webpage.name,
    path: webpage.path,
    breadcrumbs,
    content: webpage.htmlBody,
    seo: webpage.seo,
  };
});

async function getWebPageBreadcrumbs(id: string): Promise<Breadcrumb[]> {
  const t = await getTranslations('WebPages.Normal');

  const webpage = await getWebPage(id);
  const [, ...rest] = webpage.breadcrumbs.reverse();
  const breadcrumbs = [
    {
      label: t('home'),
      href: '/',
    },
    ...rest.reverse(),
    {
      label: webpage.title,
      href: '#',
    },
  ];

  return truncateBreadcrumbs(breadcrumbs, 5);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = await params;
  const webpage = await getWebPage(id);
  const makeswiftMetadata = await getMakeswiftPageMetadata({ path: webpage.path, locale });
  const { pageTitle, metaDescription, metaKeywords } = webpage.seo;

  // Get the path from the last breadcrumb
  const pagePath = webpage.breadcrumbs[webpage.breadcrumbs.length - 1]?.href;

  return {
    title: makeswiftMetadata?.title || pageTitle || webpage.title,
    ...((makeswiftMetadata?.description || metaDescription) && {
      description: makeswiftMetadata?.description || metaDescription,
    }),
    ...(metaKeywords && { keywords: metaKeywords.split(',') }),
    ...(pagePath && { alternates: await getMetadataAlternates({ path: pagePath, locale }) }),
  };
}

export default async function WebPage({ params }: Props) {
  const { locale, id } = await params;

  setRequestLocale(locale);

  return (
    <WebPageContent
      breadcrumbs={Streamable.from(() => getWebPageBreadcrumbs(id))}
      webPage={Streamable.from(() => getWebPage(id))}
    />
  );
}
