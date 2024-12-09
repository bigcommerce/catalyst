import { clsx } from 'clsx';
import { ChevronRight } from 'lucide-react';
import { Fragment } from 'react';

import { Link } from '~/components/link';

export interface Breadcrumb {
  label: string;
  href: string;
}

export interface BreadcrumbsProps {
  breadcrumbs: Breadcrumb[];
  className?: string;
}

export function Breadcrumbs({ breadcrumbs, className }: BreadcrumbsProps) {
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
                className="rounded font-medium text-contrast-500 ring-offset-4 transition-colors hover:text-foreground focus-visible:outline-0 focus-visible:ring-2 focus-visible:ring-primary"
                href={href}
              >
                {label}
              </Link>
              <ChevronRight className="text-contrast-500" size={16} strokeWidth={1} />
            </Fragment>
          );
        }

        return (
          <span className="text-contrast-400" key={idx}>
            {label}
          </span>
        );
      })}
    </nav>
  );
}
