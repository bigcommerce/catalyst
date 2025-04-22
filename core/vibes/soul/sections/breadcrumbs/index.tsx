import { clsx } from 'clsx';
import { ChevronRight } from 'lucide-react';

import { Stream } from '@/vibes/soul/lib/streamable';
import { AnimatedLink } from '@/vibes/soul/primitives/animated-link';
import * as Skeleton from '@/vibes/soul/primitives/skeleton';
import { type BreadcrumbsData } from '~/ui/breadcrumbs';

export interface BreadcrumbsProps extends BreadcrumbsData {
  className?: string;
}

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --breadcrumbs-font-family: var(--font-family-body);
 *   --breadcrumbs-primary-text: hsl(var(--foreground));
 *   --breadcrumbs-secondary-text: hsl(var(--contrast-500));
 *   --breadcrumbs-icon: hsl(var(--contrast-500));
 *   --breadcrumbs-hover: hsl(var(--primary));
 * }
 * ```
 */
export function Breadcrumbs({ breadcrumbs: streamableBreadcrumbs, className }: BreadcrumbsProps) {
  return (
    <Stream fallback={<BreadcrumbsSkeleton className={className} />} value={streamableBreadcrumbs}>
      {(breadcrumbs) => {
        if (breadcrumbs.length === 0) {
          return <BreadCrumbEmptyState className={className} />;
        }

        return (
          <nav aria-label="breadcrumb" className={clsx(className)}>
            <ol className="flex flex-wrap items-center gap-x-1.5 text-sm @xl:text-base">
              {breadcrumbs.map(({ label, href }, index) => {
                if (index < breadcrumbs.length - 1) {
                  return (
                    <li className="inline-flex items-center gap-x-1.5" key={href}>
                      <AnimatedLink
                        className="font-[family-name:var(--breadcrumbs-font-family,var(--font-family-body))] text-[var(--breadcrumbs-primary-text,hsl(var(--foreground)))] [background:linear-gradient(0deg,var(--breadcrumbs-hover,hsl(var(--primary))),var(--breadcrumbs-hover,hsl(var(--primary))))_no-repeat_left_bottom_/_0_2px]"
                        href={href}
                      >
                        {label}
                      </AnimatedLink>
                      <ChevronRight
                        aria-hidden="true"
                        className="text-[var(--breadcrumbs-icon,hsl(var(--contrast-500)))]"
                        size={20}
                        strokeWidth={1}
                      />
                    </li>
                  );
                }

                return (
                  <li
                    className="inline-flex items-center font-[family-name:var(--breadcrumbs-font-family,var(--font-family-body))] text-[var(--breadcrumbs-secondary-text,hsl(var(--contrast-500)))]"
                    key={href}
                  >
                    <span aria-current="page" aria-disabled="true" role="link">
                      {label}
                    </span>
                  </li>
                );
              })}
            </ol>
          </nav>
        );
      }}
    </Stream>
  );
}

export function BreadcrumbsSkeleton({ className }: Pick<BreadcrumbsProps, 'className'>) {
  return (
    <Skeleton.Root
      className={clsx('group-has-data-pending/breadcrumbs:animate-pulse', className)}
      pending
    >
      <div className="flex flex-wrap items-center gap-x-1.5 text-sm @xl:text-base">
        <Skeleton.Text characterCount={4} className="rounded-sm text-lg" />
        <Skeleton.Icon icon={<ChevronRight aria-hidden className="h-5 w-5" strokeWidth={1} />} />
        <Skeleton.Text characterCount={6} className="rounded-sm text-lg" />
        <Skeleton.Icon icon={<ChevronRight aria-hidden className="h-5 w-5" strokeWidth={1} />} />
        <Skeleton.Text characterCount={6} className="rounded-sm text-lg" />
      </div>
    </Skeleton.Root>
  );
}

export function BreadCrumbEmptyState({ className }: Pick<BreadcrumbsProps, 'className'>) {
  return (
    <Skeleton.Root className={className}>
      <div className={clsx('min-h-[1lh]', className)} />
    </Skeleton.Root>
  );
}
