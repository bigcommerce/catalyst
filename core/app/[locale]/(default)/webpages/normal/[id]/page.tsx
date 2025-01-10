import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Breadcrumb } from '@/vibes/soul/primitives/breadcrumbs';

import { WebPageContent, WebPage as WebPageData } from '../../_components/web-page';

import { getWebpageData } from './page-data';

interface Props {
  params: Promise<{ id: string }>;
}

async function getWebPage(id: string): Promise<WebPageData> {
  const data = await getWebpageData({ id: decodeURIComponent(id) });
  const webpage = data.node?.__typename === 'NormalPage' ? data.node : null;

  if (!webpage) {
    return notFound();
  }

  return {
    title: webpage.name,
    content: webpage.htmlBody,
    seo: webpage.seo,
  };
}

async function getWebPageBreadcrumbs(id: string): Promise<Breadcrumb[]> {
  const webpage = await getWebPage(id);

  return [
    {
      label: 'Home',
      href: '/',
    },
    {
      label: webpage.title,
      href: '#',
    },
  ];
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
  const { id } = await params;

  return <WebPageContent breadcrumbs={getWebPageBreadcrumbs(id)} webPage={getWebPage(id)} />;
}
