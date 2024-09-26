'use client';

import { clsx } from 'clsx';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Link } from '~/components/link';
import { usePathname } from '~/i18n/routing';

export const Pagination = function Pagination({ pages: totalPages }: { pages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialPage = parseInt(searchParams.get('page') ?? '1', 10);

  const [currentPage, setCurrentPage] = useState(initialPage);

  useEffect(() => {
    const current = parseInt(searchParams.get('page') ?? '1', 10);

    if (current !== currentPage) {
      setCurrentPage(current);
    }
  }, [currentPage, searchParams]);

  const renderPagination = () => {
    const pages = [];

    if (totalPages <= 4) {
      // eslint-disable-next-line no-plusplus
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      if (currentPage > 2 && currentPage < totalPages - 1) {
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
      } else if (currentPage <= 2) {
        pages.push(2);
        pages.push(3);
      } else {
        pages.push(totalPages - 2);
        pages.push(totalPages - 1);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex w-full justify-center bg-background py-10 text-xs">
      <div className="flex gap-2">
        {renderPagination().map((page, index) =>
          typeof page === 'string' ? (
            <span
              className="hidden h-12 w-12 items-center justify-center text-foreground @lg:flex"
              key={index}
            >
              ...
            </span>
          ) : (
            <Link
              className={clsx(
                'flex h-12 w-12 items-center justify-center rounded-full border transition-colors duration-300',
                'ring-primary focus-visible:outline-0 focus-visible:ring-2',
                page === currentPage
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-contrast-100 text-foreground hover:bg-contrast-100',
              )}
              href={`${pathname}?page=${page.toString()}`}
              key={index}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Link>
          ),
        )}
      </div>
    </div>
  );
};
