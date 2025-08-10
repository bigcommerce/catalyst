import type { Metadata } from 'next';
import { getBrandsData } from './page-data';
import { SectionLayout } from '@/vibes/soul/sections/section-layout';
import { CursorPagination } from '@/vibes/soul/primitives/cursor-pagination';
import { BrandCard } from '@/vibes/soul/primitives/brand-card';
import { parseAsInteger, parseAsString, SearchParams } from 'nuqs/server';
import { createSearchParamsCache } from 'nuqs/server';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { ArrowLeft, ArrowRight, Link } from 'lucide-react';

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
  page: parseAsString.withDefault('1'),
  limit: parseAsInteger.withDefault(defaultBrandLimit),
});

export default async function BrandsPage(props: Props) {
  const { locale } = await props.params;

  setRequestLocale(locale);

  // Parse search params for pagination
  const searchParamsParsed = searchParamsCache.parse(await props.searchParams);
  const { page, limit } = searchParamsParsed;

  // Fetch brands data
  const { brands, pageInfo: paginationInfo } = await getBrandsData({
    page,
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
      <PageNumberPagination
        currentPage={parseInt(page, 10)}
        totalPages={paginationInfo?.total_pages || 1}
        basePath={`/brands`}
      />
    </SectionLayout>
  );
}

type PageNumberPaginationProps = {
  currentPage: number;
  totalPages: number;
  basePath: string; // e.g., "/brands"
  scroll?: boolean;
};

export function PageNumberPagination({
  currentPage,
  totalPages,
  basePath,
  scroll,
}: PageNumberPaginationProps) {
  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  return (
    <nav aria-label="pagination" className="py-10" role="navigation">
      <ul className="flex items-center justify-center gap-3">
        <li>
          {prevPage ? (
            <Link
              href={`${basePath}?page=${prevPage}`}
              aria-label="Go to previous page"
              className="pagination-arrow"
            >
              <ArrowLeft size={24} strokeWidth={1} />
            </Link>
          ) : (
            <span className="opacity-50">
              <ArrowLeft size={24} strokeWidth={1} />
            </span>
          )}
        </li>
        <li>
          <span>
            Page {currentPage} of {totalPages}
          </span>
        </li>
        <li>
          {nextPage ? (
            <Link
              href={`${basePath}?page=${nextPage}`}
              aria-label="Go to next page"
              className="pagination-arrow"
            >
              <ArrowRight size={24} strokeWidth={1} />
            </Link>
          ) : (
            <span className="opacity-50">
              <ArrowRight size={24} strokeWidth={1} />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
