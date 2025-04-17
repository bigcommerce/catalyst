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
  const { id } = await params;
  const webpage = await getWebPage(id);
  const { pageTitle, metaDescription, metaKeywords } = webpage.seo;

  return {
    title: pageTitle || webpage.title,
    description: metaDescription,
    keywords: metaKeywords ? metaKeywords.split(',') : null,
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
