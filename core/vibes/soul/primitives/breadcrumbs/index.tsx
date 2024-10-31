import { Link } from '~/components/link';
import { Fragment } from 'react';

import { clsx } from 'clsx';
import { ChevronRight } from 'lucide-react';

export interface Breadcrumb {
  label: string;
  href: string;
}

export interface BreadcrumbsProps {
  breadcrumbs: Breadcrumb[];
  className?: string;
}

export const Breadcrumbs = function Breadcrumbs({ breadcrumbs, className }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="breadcrumb"
      className={clsx(
        'inline-flex flex-wrap items-center gap-x-2 text-sm @xl:text-base',
        className,
      )}
    >
      {breadcrumbs.map(({ label, href }, idx) => {
        if (idx < breadcrumbs.length - 1) {
          return (
            <Fragment key={idx}>
              <Link
                href={href}
                className="rounded font-medium text-contrast-500 ring-offset-4 transition-colors hover:text-foreground focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary"
              >
                {label}
              </Link>
              <ChevronRight size={16} strokeWidth={1} className="text-contrast-500" />
            </Fragment>
          );
        } else {
          return (
            <span key={idx} className="text-contrast-400">
              {label}
            </span>
          );
        }
      })}
    </nav>
  );
};
