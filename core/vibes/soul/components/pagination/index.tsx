'use client';

import { clsx } from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

import { Link } from '~/components/link';
import { usePathname } from '~/i18n/routing';

interface Props {
  className?: string;
  endCursor?: string;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  startCursor?: string;
}

export const Pagination = function Pagination({
  className,
  endCursor,
  hasPreviousPage,
  hasNextPage,
  startCursor,
}: Props) {
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
    <nav className={clsx('flex w-full justify-center bg-background py-10 text-xs', className)}>
      <div className="flex gap-2">
        {hasPreviousPage ? (
          <Link
            className={clsx(
              'flex h-12 w-12 items-center justify-center rounded-full border transition-colors duration-300',
              'ring-primary focus-visible:outline-0 focus-visible:ring-2',
              'border-contrast-100 text-foreground hover:bg-contrast-100',
            )}
            href={`${pathname}?${beforeSearchParams.toString()}`}
          >
            <span className="sr-only">Previous</span>
            <ChevronLeft aria-hidden="true" className="" />
          </Link>
        ) : (
          <span
            className={clsx(
              'flex h-12 w-12 items-center justify-center rounded-full border transition-colors duration-300',
              'ring-primary focus-visible:outline-0 focus-visible:ring-2',
              'border-contrast-100 text-foreground',
            )}
          >
            <ChevronLeft aria-hidden="true" className="m-2 inline-block h-8 w-8 text-gray-200" />
          </span>
        )}

        {hasNextPage ? (
          <Link
            className={clsx(
              'flex h-12 w-12 items-center justify-center rounded-full border transition-colors duration-300',
              'ring-primary focus-visible:outline-0 focus-visible:ring-2',
              'border-contrast-100 text-foreground hover:bg-contrast-100',
            )}
            href={`${pathname}?${afterSearchParams.toString()}`}
          >
            <span className="sr-only">Next</span>
            <ChevronRight aria-hidden="true" className="m-2 inline-block h-8 w-8" />
          </Link>
        ) : (
          <span
            className={clsx(
              'flex h-12 w-12 items-center justify-center rounded-full border transition-colors duration-300',
              'ring-primary focus-visible:outline-0 focus-visible:ring-2',
              'border-contrast-100 text-foreground',
            )}
          >
            <ChevronRight aria-hidden="true" className="m-2 inline-block h-8 w-8 text-gray-200" />
          </span>
        )}
      </div>
    </nav>
  );
};
