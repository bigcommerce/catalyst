'use client';

import { clsx } from 'clsx';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { createSerializer, parseAsString } from 'nuqs';
import { Suspense } from 'react';

import { Streamable, useStreamable } from '@/ui/lib/streamable';
import { Link } from '~/components/link';

export interface CursorPaginationInfo {
  startCursorParamName?: string;
  startCursor?: string | null;
  endCursorParamName?: string;
  endCursor?: string | null;
}

interface Props {
  label?: Streamable<string | null>;
  info: Streamable<CursorPaginationInfo>;
  previousLabel?: Streamable<string | null>;
  nextLabel?: Streamable<string | null>;
  scroll?: boolean;
}

export function CursorPagination(props: Props) {
  return (
    <Suspense fallback={<CursorPaginationSkeleton />}>
      <CursorPaginationResolved {...props} />
    </Suspense>
  );
}

function CursorPaginationResolved({
  label: streamableLabel,
  info,
  previousLabel: streamablePreviousLabel,
  nextLabel: streamableNextLabel,
  scroll,
}: Props) {
  const label = useStreamable(streamableLabel) ?? 'pagination';
  const {
    startCursorParamName = 'before',
    endCursorParamName = 'after',
    startCursor,
    endCursor,
  } = useStreamable(info);
  const searchParams = useSearchParams();
  const serialize = createSerializer({
    [startCursorParamName]: parseAsString,
    [endCursorParamName]: parseAsString,
  });
  const previousLabel = useStreamable(streamablePreviousLabel) ?? 'Go to previous page';
  const nextLabel = useStreamable(streamableNextLabel) ?? 'Go to next page';

  return (
    <nav aria-label={label} className="py-10" role="navigation">
      <ul className="flex items-center justify-center gap-3">
        <li>
          {startCursor != null ? (
            <PaginationLink
              aria-label={previousLabel}
              href={serialize(searchParams, {
                [startCursorParamName]: startCursor,
                [endCursorParamName]: null,
              })}
              scroll={scroll}
            >
              <ArrowLeft size={24} strokeWidth={1} />
            </PaginationLink>
          ) : (
            <SkeletonLink>
              <ArrowLeft size={24} strokeWidth={1} />
            </SkeletonLink>
          )}
        </li>
        <li>
          {endCursor != null ? (
            <PaginationLink
              aria-label={nextLabel}
              href={serialize(searchParams, {
                [endCursorParamName]: endCursor,
                [startCursorParamName]: null,
              })}
              scroll={scroll}
            >
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
        'border-contrast-100 text-foreground ring-primary hover:border-contrast-200 hover:bg-contrast-100 flex h-12 w-12 items-center justify-center rounded-full border transition-colors duration-300 focus-visible:ring-2 focus-visible:outline-0',
      )}
      href={href}
      scroll={scroll}
    >
      {children}
    </Link>
  );
}

function SkeletonLink({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-contrast-100 text-foreground flex h-12 w-12 cursor-not-allowed items-center justify-center rounded-full border opacity-50 duration-300">
      {children}
    </div>
  );
}

export function CursorPaginationSkeleton() {
  return (
    <div className="bg-background flex w-full justify-center py-10 text-xs">
      <div className="flex gap-2">
        <SkeletonLink>
          <ArrowLeft />
        </SkeletonLink>
        <SkeletonLink>
          <ArrowRight />
        </SkeletonLink>
      </div>
    </div>
  );
}
