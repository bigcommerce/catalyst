'use client';

import clsx from 'clsx';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { createSerializer, parseAsString } from 'nuqs';
import { Suspense, use } from 'react';

import { Link } from '~/components/link';

export type CursorPaginationInfo = {
  startCursorParamName?: string;
  startCursor?: string | null;
  endCursorParamName?: string;
  endCursor?: string | null;
};

type Props = {
  info: CursorPaginationInfo | Promise<CursorPaginationInfo>;
  scroll?: boolean;
};

export function CursorPagination(props: Props) {
  return (
    <Suspense fallback={<CursorPaginationSkeleton />}>
      <CursorPaginationResolved {...props} />
    </Suspense>
  );
}

function CursorPaginationResolved({ info, scroll }: Props) {
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
        <PaginationLink
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
      {endCursor != null ? (
        <PaginationLink
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
    </div>
  );
}

function PaginationLink({
  href,
  children,
  scroll,
}: {
  href: string;
  children: React.ReactNode;
  scroll?: boolean;
}) {
  return (
    <Link
      className={clsx(
        'flex h-12 w-12 items-center justify-center rounded-full border border-contrast-100 text-foreground ring-primary transition-colors duration-300 hover:border-contrast-200 hover:bg-contrast-100 focus-visible:outline-0 focus-visible:ring-2',
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
