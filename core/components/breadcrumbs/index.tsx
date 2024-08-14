import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';

import { FragmentOf, graphql } from '~/client/graphql';

import { Breadcrumbs as ComponentsBreadcrumbs } from '../ui/breadcrumbs';

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
  const breadcrumbs = removeEdgesAndNodes(category.breadcrumbs).map(({ name, path }) => ({
    label: name,
    href: path ?? '#',
  }));

  return <ComponentsBreadcrumbs breadcrumbs={breadcrumbs} />;
};
