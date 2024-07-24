'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';

import { Link } from '~/components/link';
import { cn } from '~/lib/utils';

interface PaginationProps {
  className?: string;
  endCursor: string | null;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  startCursor: string | null;
  prevLabel: string;
  nextLabel: string;
}

export const Pagination = ({
  className,
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

  if (startCursor) {
    beforeSearchParams.set('before', String(startCursor));
  }

  const afterSearchParams = new URLSearchParams(searchParams);

  afterSearchParams.delete('before');

  if (endCursor) {
    afterSearchParams.set('after', String(endCursor));
  }

  return (
    <nav aria-label="Pagination" className={cn('my-6 text-center text-primary', className)}>
      {hasPreviousPage ? (
        <Link className="inline-block" href={`${pathname}?${beforeSearchParams.toString()}`}>
          <span className="sr-only">{prevLabel}</span>
          <ChevronLeft aria-hidden="true" className="m-2 inline-block h-8 w-8" />
        </Link>
      ) : (
        <ChevronLeft aria-hidden="true" className="m-2 inline-block h-8 w-8 text-gray-200" />
      )}

      {hasNextPage ? (
        <Link className="inline-block" href={`${pathname}?${afterSearchParams.toString()}`}>
          <span className="sr-only">{nextLabel}</span>
          <ChevronRight aria-hidden="true" className="m-2 inline-block h-8 w-8" />
        </Link>
      ) : (
        <ChevronRight aria-hidden="true" className="m-2 inline-block h-8 w-8 text-gray-200" />
      )}
    </nav>
  );
};
