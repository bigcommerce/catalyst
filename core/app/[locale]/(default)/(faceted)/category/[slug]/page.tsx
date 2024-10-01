import type { Metadata } from 'next';
import { unstable_setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { CompareProductsSkeleton } from '@/vibes/soul/components/compare-products';
import { LocaleType } from '~/i18n/routing';

import { ProductList } from './_components/product-list';
import { getCategoryPageData } from './page-data';

interface Props {
  params: {
    slug: string;
    locale: LocaleType;
  };
  searchParams: Record<string, string | string[] | undefined>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const categoryId = Number(params.slug);

  const data = await getCategoryPageData({
    categoryId,
  });

  const category = data.category;

  if (!category) {
    return {};
  }

  const { pageTitle, metaDescription, metaKeywords } = category.seo;

  return {
    title: pageTitle || category.name,
    description: metaDescription,
    keywords: metaKeywords ? metaKeywords.split(',') : null,
  };
}

export default function Category({ params: { locale, slug }, searchParams }: Props) {
  unstable_setRequestLocale(locale);

  const categoryId = Number(slug);

  return (
    <Suspense fallback={<CompareProductsSkeleton />}>
      <ProductList categoryId={categoryId} searchParams={searchParams} />;
    </Suspense>
  );
}

export const runtime = 'edge';
