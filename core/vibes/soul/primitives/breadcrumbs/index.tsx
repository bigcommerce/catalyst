import { clsx } from 'clsx';
import { ChevronRight } from 'lucide-react';

import { AnimatedLink } from '@/vibes/soul/primitives/animated-link';

export interface Breadcrumb {
  label: string;
  href: string;
}

export interface BreadcrumbsProps {
  breadcrumbs: Breadcrumb[];
  className?: string;
}

export function Breadcrumbs({ breadcrumbs, className }: BreadcrumbsProps) {
  if (breadcrumbs.length === 0) {
    return <div className={clsx('min-h-[1lh]', className)} />;
  }

  return (
    <nav aria-label="breadcrumb" className={clsx(className)}>
      <ol className="flex flex-wrap items-center gap-x-1.5 text-sm @xl:text-base">
        {breadcrumbs.map(({ label, href }, idx) => {
          if (idx < breadcrumbs.length - 1) {
            return (
              <li className="inline-flex items-center gap-x-1.5" key={idx}>
                <AnimatedLink label={label} link={{ href }} />
                <ChevronRight
                  aria-hidden="true"
                  className="text-contrast-500"
                  size={20}
                  strokeWidth={1}
                />
              </li>
            );
          }

          return (
            <li className="inline-flex items-center text-contrast-500" key={idx}>
              <span aria-current="page" aria-disabled="true" role="link">
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function BreadcrumbsSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        'flex min-h-[1lh] animate-pulse flex-wrap items-center gap-x-1.5 text-base',
        className,
      )}
    >
      <div className="flex h-[1lh] items-center">
        <span className="block h-[1.25ex] w-[4ch] rounded bg-contrast-100" />
      </div>
      <ChevronRight aria-hidden="true" className="text-contrast-200" size={20} strokeWidth={1} />
      <div className="flex h-[1lh] items-center">
        <span className="block h-[1.25ex] w-[6ch] rounded bg-contrast-100" />
      </div>
      <ChevronRight aria-hidden="true" className="text-contrast-200" size={20} strokeWidth={1} />
      <div className="flex h-[1lh] items-center">
        <span className="block h-[1.25ex] w-[6ch] rounded bg-contrast-100" />
      </div>
    </div>
  );
}
