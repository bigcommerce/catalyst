import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';

import { FragmentOf, graphql } from '~/client/graphql';

import { BaseFooterMenu } from './base-footer-menu';

export const BrandsFooterMenuFragment = graphql(`
  fragment BrandsFooterMenuFragment on BrandConnection {
    edges {
      node {
        entityId
        name
        path
      }
    }
  }
`);

interface Props {
  data: FragmentOf<typeof BrandsFooterMenuFragment>;
}

export const BrandFooterMenu = ({ data }: Props) => {
  const brands = removeEdgesAndNodes(data);

  if (!brands.length) {
    return null;
  }

  return <BaseFooterMenu items={brands} title="Brands" />;
};
