import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';

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
    <nav>
      <ul className="m-0 flex flex-wrap items-center p-0 md:container md:mx-auto ">
        {breadcrumbs.map(({ name, path }, i, arr) => {
          const isLast = arr.length - 1 === i;

          return (
            <li
              className={cn('p-1 ps-0 hover:text-primary', {
                'font-semibold': !isLast,
                'font-extrabold': isLast,
              })}
              key={name}
            >
              <Link href={path ?? '#'}>{name}</Link>
              {!isLast && <span className="mx-2">/</span>}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
