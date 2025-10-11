import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
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
  params: Promise<{ id: string }>;
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
  const webpage = await getWebPage(id);
  const [, ...rest] = webpage.breadcrumbs.reverse();
  const breadcrumbs = [
    {
      label: 'Home',
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

  const title =
    pageTitle && pageTitle.length >= 10 && pageTitle.length <= 60
      ? pageTitle
      : `${webpage.title} | Information & Details`;
  const description =
    metaDescription && metaDescription.length <= 160
      ? metaDescription
      : `${webpage.title} - Learn more about this page.`;
  const siteName = process.env.NEXT_PUBLIC_STORE_NAME || 'GI Tool Store';
  const pageUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/webpages/${webpage.title}`
    : `https://gitool.com/webpages/${webpage.title}`;
  return {
    title,
    description,
    keywords: metaKeywords ? metaKeywords.split(',') : null,
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName,
      images: [
        {
          url: process.env.NEXT_PUBLIC_OG_IMAGE || '/favicon.ico',
          alt: `${siteName} Logo`,
        },
      ],
    },
  };
}

export default async function WebPage({ params }: Props) {
  const { id } = await params;

  return (
    <>
      {/* Schema.org WebPage structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: id,
            description: 'Information and details about this page.',
            url: process.env.NEXT_PUBLIC_SITE_URL
              ? `${process.env.NEXT_PUBLIC_SITE_URL}/webpages/${id}`
              : `https://example.com/webpages/${id}`,
          }),
        }}
      />
      <WebPageContent
        breadcrumbs={Streamable.from(() => getWebPageBreadcrumbs(id))}
        webPage={Streamable.from(() => getWebPage(id))}
      />
    </>
  );
}
