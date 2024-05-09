import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { ChevronRight } from 'lucide-react';
import { Fragment } from 'react';

import { FragmentOf, graphql } from '~/client/graphql';
import { Link } from '~/components/link';

import {
  BreadcrumbDivider,
  BreadcrumbItem,
  Breadcrumbs as ComponentsBreadcrumbs,
} from '../ui/breadcrumbs';

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
    <ComponentsBreadcrumbs className="py-4">
      {breadcrumbs.map(({ name, path }, i, arr) => {
        const isLast = arr.length - 1 === i;

        return (
          <Fragment key={name}>
            <BreadcrumbItem asChild isActive={isLast}>
              <Link href={path ?? '#'}>{name}</Link>
            </BreadcrumbItem>
            {!isLast ? (
              <BreadcrumbDivider>
                <ChevronRight aria-hidden="true" size={20} />
              </BreadcrumbDivider>
            ) : null}
          </Fragment>
        );
      })}
    </ComponentsBreadcrumbs>
  );
};
