import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { ResultOf } from 'gql.tada';

import {
  BreadcrumbsCategoryFragment,
  BreadcrumbsWebPageFragment,
} from '~/components/breadcrumbs/fragment';
import { BreadcrumbWithId } from '~/vibes/soul/sections/breadcrumbs';

type BreadcrumbsResult =
  | ResultOf<typeof BreadcrumbsWebPageFragment>
  | ResultOf<typeof BreadcrumbsCategoryFragment>;

export const breadcrumbsTransformer = (breadcrumbs: BreadcrumbsResult['breadcrumbs']) => {
  return removeEdgesAndNodes(breadcrumbs).reduce<BreadcrumbWithId[]>((acc, crumb) => {
    if (crumb.path) {
      return [...acc, { label: crumb.name, href: crumb.path, id: crumb.path }];
    }

    return acc;
  }, []);
};

export function truncateBreadcrumbs(
  breadcrumbs: BreadcrumbWithId[],
  length: number,
): BreadcrumbWithId[] {
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

  last[0] = { label: '...', href: '#', id: '...' };

  return [...first, ...last];
}
