import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { ResultOf } from 'gql.tada';

import {
  BreadcrumbsCategoryFragment,
  BreadcrumbsWebPageFragment,
} from '~/components/breadcrumbs/fragment';
import { Breadcrumb } from '~/vibes/soul/primitives/breadcrumbs';

type BreadcrumbsResult =
  | ResultOf<typeof BreadcrumbsWebPageFragment>
  | ResultOf<typeof BreadcrumbsCategoryFragment>;

export const breadcrumbsTransformer = (breadcrumbs: BreadcrumbsResult['breadcrumbs']) => {
  return removeEdgesAndNodes(breadcrumbs).reduce<Breadcrumb[]>((acc, crumb) => {
    if (crumb.path) {
      return [...acc, { label: crumb.name, href: crumb.path }];
    }

    return acc;
  }, []);
};

export function truncateBreadcrumbs(breadcrumbs: Breadcrumb[], length: number): Breadcrumb[] {
  if (breadcrumbs.length < length) {
    return breadcrumbs;
  }

  const middleIndex = Math.floor(breadcrumbs.length / 2);
  const dropCount = breadcrumbs.length - length;
  const dropEach = Math.ceil(dropCount / 2);
  const dropLast = Math.floor(dropCount / 2);
  const [first, last] = [
    breadcrumbs.slice(0, middleIndex - dropEach),
    breadcrumbs.slice(middleIndex + dropLast),
  ];

  last[0] = { label: '...', href: '#' };

  return [...first, ...last];
}
