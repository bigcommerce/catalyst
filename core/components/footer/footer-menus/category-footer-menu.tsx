import { FragmentOf, graphql } from '~/client/graphql';

import { BaseFooterMenu } from './base-footer-menu';

export const CategoryFooterMenuFragment = graphql(`
  fragment CategoryFooterMenuFragment on Site {
    categoryTree {
      name
      path
    }
  }
`);

interface Props {
  data: FragmentOf<typeof CategoryFooterMenuFragment>['categoryTree'];
}

export const CategoryFooterMenu = ({ data }: Props) => {
  if (!data.length) {
    return null;
  }

  return <BaseFooterMenu items={data} title="Categories" />;
};
