import type { Metadata } from 'next';
import { unstable_setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { CompareProductsSkeleton } from '@/vibes/soul/components/compare-products';
import { LocaleType } from '~/i18n/routing';

import { ProductList } from './_components/product-list';
import { getBrand } from './page-data';

interface Props {
  params: {
    slug: string;
    locale: LocaleType;
  };
  searchParams: Record<string, string | string[] | undefined>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const brandId = Number(params.slug);

  const brand = await getBrand({ entityId: brandId });

  if (!brand) {
    return {};
  }

  const { pageTitle, metaDescription, metaKeywords } = brand.seo;

  return {
    title: pageTitle || brand.name,
    description: metaDescription,
    keywords: metaKeywords ? metaKeywords.split(',') : null,
  };
}

export default function Brand({ params: { slug, locale }, searchParams }: Props) {
  unstable_setRequestLocale(locale);

  const brandId = Number(slug);

  return (
    <Suspense fallback={<CompareProductsSkeleton />}>
      <ProductList brandId={brandId} searchParams={searchParams} />;
    </Suspense>
  );
}

export const runtime = 'edge';
