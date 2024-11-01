'use client';

import { Link } from '~/components/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, use } from 'react';

import clsx from 'clsx';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { createSerializer, parseAsString } from 'nuqs';

export interface CursorPaginationInfo {
  startCursorParamName?: string;
  startCursor?: string;
  endCursorParamName?: string;
  endCursor?: string;
}

interface Props {
  info: CursorPaginationInfo | Promise<CursorPaginationInfo>;
}

export function CursorPagination({ info }: Props) {
  return (
    <Suspense fallback={<CursorPaginationSkeleton />}>
      <CursorPaginationResolved info={info} />
    </Suspense>
  );
}

function CursorPaginationResolved({ info }: Props) {
  const {
    startCursorParamName = 'before',
    endCursorParamName = 'after',
    startCursor,
    endCursor,
  } = info instanceof Promise ? use(info) : info;
  const searchParams = useSearchParams();
  const serialize = createSerializer({
    [startCursorParamName]: parseAsString,
    [endCursorParamName]: parseAsString,
  });

  return (
    <div className="flex w-full items-center justify-center gap-3 py-10">
      {startCursor != null ? (
        <PaginationLink href={serialize(searchParams, { [startCursorParamName]: startCursor })}>
          <ArrowLeft size={24} strokeWidth={1} />
        </PaginationLink>
      ) : (
        <SkeletonLink>
          <ArrowLeft size={24} strokeWidth={1} />
        </SkeletonLink>
      )}
      {endCursor != null ? (
        <PaginationLink href={serialize(searchParams, { [endCursorParamName]: endCursor })}>
          <ArrowRight size={24} strokeWidth={1} />
        </PaginationLink>
      ) : (
        <SkeletonLink>
          <ArrowRight size={24} strokeWidth={1} />
        </SkeletonLink>
      )}
    </div>
  );
}

function PaginationLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={clsx(
        'flex h-12 w-12 items-center justify-center rounded-full border border-contrast-100 text-foreground ring-primary transition-colors duration-300 hover:border-contrast-200 hover:bg-contrast-100 focus-visible:outline-0 focus-visible:ring-2',
      )}
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

export function CursorPaginationSkeleton() {
  return (
    <div className="flex w-full justify-center bg-background py-10 text-xs">
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
