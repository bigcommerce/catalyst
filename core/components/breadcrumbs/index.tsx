import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { ChevronRight } from 'lucide-react';
import { Fragment } from 'react';

import { FragmentOf, graphql } from '~/client/graphql';
import { Link } from '~/components/link';
import { cn } from '~/lib/utils';

export const BreadcrumbsFragment = graphql(`
  fragment BreadcrumbsFragment on Category {
    breadcrumbs(depth: 5) {
      edges {
        node {
          name
          path
        }
      }
    }
  }
`);

interface Props {
  category: FragmentOf<typeof BreadcrumbsFragment>;
}

export const Breadcrumbs = ({ category }: Props) => {
  const breadcrumbs = removeEdgesAndNodes(category.breadcrumbs);

  return (
    <nav aria-label="Breadcrumb">
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
