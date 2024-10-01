import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { CompareProductsSkeleton } from '@/vibes/soul/components/compare-products';
import { SearchForm } from '~/components/search-form';

import { ProductList } from './_components/product-list';

export async function generateMetadata() {
  const t = await getTranslations('Search');

  return {
    title: t('title'),
  };
}

interface Props {
  searchParams: Record<string, string | string[] | undefined>;
}

export default function Search({ searchParams }: Props) {
  const t = useTranslations('Search');

  const searchTerm = typeof searchParams.term === 'string' ? searchParams.term : undefined;

  if (!searchTerm) {
    return (
      <>
        <h1 className="mb-3 text-4xl font-black lg:text-5xl">{t('heading')}</h1>
        <SearchForm />
      </>
    );
  }

  return (
    <Suspense fallback={<CompareProductsSkeleton />}>
      <ProductList searchParams={searchParams} searchTerm={searchTerm} />
    </Suspense>
  );
}

export const runtime = 'edge';
