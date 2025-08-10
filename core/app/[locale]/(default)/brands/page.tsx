import type { Metadata } from 'next';
import { getBrandsData } from './page-data';
import { SectionLayout } from '@/vibes/soul/sections/section-layout';
import { CursorPagination } from '@/vibes/soul/primitives/cursor-pagination';
import { BrandCard } from '@/vibes/soul/primitives/brand-card';
import { parseAsInteger, parseAsString, SearchParams } from 'nuqs/server';
import { createSearchParamsCache } from 'nuqs/server';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Brands',
    description: 'Explore our diverse range of brands offering quality products.',
  };
}

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}

const defaultBrandLimit = 18;

const searchParamsCache = createSearchParamsCache({
  before: parseAsString,
  after: parseAsString,
  limit: parseAsInteger.withDefault(defaultBrandLimit),
});

export default async function BrandsPage(props: Props) {
  const { locale } = await props.params;

  setRequestLocale(locale);

  // Parse search params for pagination
  const searchParamsParsed = searchParamsCache.parse(await props.searchParams);
  const { before, after, limit } = searchParamsParsed;

  // Fetch brands data
  const { brands, pageInfo: paginationInfo } = await getBrandsData({
    page: after ? after : undefined,
    limit,
  });

  if (brands.length === 0) {
    return notFound();
  }

  return (
    <SectionLayout
      hideOverflow={true}
      paddingOptionsLargeDesktop="px-8"
      paddingOptionsDesktop="px-6"
      paddingOptionsTablet="px-4"
      paddingOptionsMobile="px-2"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-6">
        {brands.map((brand) => (
          <BrandCard
            href={brand.path}
            name={brand.name}
            title={brand.name}
            productCount={brand.productsCount.toString()}
            imageUrl={brand.defaultImage?.urlOriginal}
            key={brand.path}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {paginationInfo && <CursorPagination info={paginationInfo} />}
    </SectionLayout>
  );
}
