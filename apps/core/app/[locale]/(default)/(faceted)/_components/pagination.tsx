'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
// Using Next's Link until issue with next-intl Link is resolved:
// https://github.com/amannn/next-intl/issues/918
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import NextLink from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

interface PaginationProps {
  endCursor: string | null;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  startCursor: string | null;
  prevLabel: string;
  nextLabel: string;
}

export const Pagination = ({
  endCursor,
  hasPreviousPage,
  hasNextPage,
  startCursor,
  prevLabel,
  nextLabel,
}: PaginationProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const beforeSearchParams = new URLSearchParams(searchParams);

  beforeSearchParams.delete('after');
  beforeSearchParams.set('before', String(startCursor));

  const afterSearchParams = new URLSearchParams(searchParams);

  afterSearchParams.delete('before');
  afterSearchParams.set('after', String(endCursor));

  return (
    <nav aria-label="Pagination" className="my-6 text-center text-blue-primary">
      {hasPreviousPage ? (
        <NextLink href={`${pathname}?${beforeSearchParams.toString()}`}>
          <span className="sr-only">{prevLabel}</span>
          <ChevronLeft aria-hidden="true" className="inline-block h-8 w-8" />
        </NextLink>
      ) : (
        <ChevronLeft aria-hidden="true" className="inline-block h-8 w-8 text-gray-200" />
      )}

      {hasNextPage ? (
        <NextLink href={`${pathname}?${afterSearchParams.toString()}`}>
          <span className="sr-only">{nextLabel}</span>
          <ChevronRight aria-hidden="true" className="inline-block h-8 w-8" />
        </NextLink>
      ) : (
        <ChevronRight aria-hidden="true" className="inline-block h-8 w-8 text-gray-200" />
      )}
    </nav>
  );
};
