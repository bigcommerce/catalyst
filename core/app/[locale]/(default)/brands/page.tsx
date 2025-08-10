import type { Metadata } from 'next';
import { getBrandsData } from './page-data';
import { SectionLayout } from '@/vibes/soul/sections/section-layout';
import { CursorPagination } from '@/vibes/soul/primitives/cursor-pagination';
import { BrandCard } from '@/vibes/soul/primitives/brand-card';
import { parseAsInteger, parseAsString, SearchParams } from 'nuqs/server';
import { createSearchParamsCache } from 'nuqs/server';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import { Link } from '~/components/link';

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
            <PaginationLink href={`${basePath}?page=${prevPage}`} aria-label="Go to previous page">
              <ArrowLeft size={24} strokeWidth={1} />
            </PaginationLink>
          ) : (
            <SkeletonLink>
              <ArrowLeft size={24} strokeWidth={1} />
            </SkeletonLink>
          )}
        </li>
        <li>
          {nextPage ? (
            <PaginationLink href={`${basePath}?page=${nextPage}`} aria-label="Go to next page">
              <ArrowRight size={24} strokeWidth={1} />
            </PaginationLink>
          ) : (
            <SkeletonLink>
              <ArrowRight size={24} strokeWidth={1} />
            </SkeletonLink>
          )}
        </li>
      </ul>
    </nav>
  );
}

function PaginationLink({
  href,
  children,
  scroll,
  'aria-label': ariaLabel,
}: {
  href: string;
  children: React.ReactNode;
  scroll?: boolean;
  ['aria-label']?: string;
}) {
  return (
    <Link
      aria-label={ariaLabel}
      className={clsx(
        'flex h-12 w-12 items-center justify-center rounded-full border border-contrast-100 text-foreground ring-primary transition-colors duration-300 hover:border-contrast-200 hover:bg-contrast-100 focus-visible:outline-0 focus-visible:ring-2',
      )}
      href={href}
    >
      {children}
    </Link>
  );
}

function SkeletonLink({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-12 w-12 cursor-not-allowed items-center justify-center rounded-full border border-contrast-100 text-foreground opacity-50 duration-300">
      {children}
    </div>
  );
}
