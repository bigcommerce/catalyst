import { ChevronRight } from 'lucide-react';
import { ComponentPropsWithoutRef, Fragment } from 'react';

import { Link } from '~/components/link';
import { cn } from '~/lib/utils';

interface Props extends ComponentPropsWithoutRef<'nav'> {
  breadcrumbs: Array<{
    name: string;
    path: string | null;
  }>;
}

const Breadcrumbs = ({ breadcrumbs, className }: Props) => {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ul className="flex flex-wrap items-center py-4">
        {breadcrumbs.map(({ name, path }, i, arr) => {
          const isLast = arr.length - 1 === i;

          return (
            <Fragment key={name}>
              <li className="flex items-center text-sm font-semibold text-black">
                <Link
                  aria-current={isLast ? `page` : undefined}
                  className={cn(
                    'font-semibold hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20',
                    isLast && 'font-extrabold',
                  )}
                  href={path ?? '#'}
                >
                  {name}
                </Link>
              </li>
              {!isLast ? (
                <span className="mx-1">
                  <ChevronRight aria-hidden="true" size={20} />
                </span>
              ) : null}
            </Fragment>
          );
        })}
      </ul>
    </nav>
  );
};

export { Breadcrumbs };
