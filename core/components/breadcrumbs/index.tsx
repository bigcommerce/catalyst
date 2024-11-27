import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';

import { FragmentOf } from '~/client/graphql';

import { Breadcrumbs as ComponentsBreadcrumbs } from '../ui/breadcrumbs';

import { BreadcrumbsFragment } from './fragment';

interface Props {
  category: FragmentOf<typeof BreadcrumbsFragment>;
}

export const Breadcrumbs = ({ category }: Props) => {
  const breadcrumbs = removeEdgesAndNodes(category.breadcrumbs).map(({ name, path }) => ({
    label: name,
    href: path ?? '#',
  }));

  if (breadcrumbs.length < 2) {
    return null;
  }

  return <ComponentsBreadcrumbs breadcrumbs={breadcrumbs} />;
};
