import { graphql } from '~/client/graphql';
import { BreadcrumbsFragment } from '~/components/breadcrumbs/fragment';
import { ProductFormFragment } from '~/components/product-form/fragment';

import { PricingFragment } from './pricing';

export const ProductItemFragment = graphql(
  `
    fragment ProductItemFragment on Product {
      entityId
      name
      sku
      categories(first: 1) {
        edges {
          node {
            ...BreadcrumbsFragment
          }
        }
      }
      brand {
        name
      }
      ...PricingFragment
      ...ProductFormFragment
    }
  `,
  [BreadcrumbsFragment, PricingFragment, ProductFormFragment],
);
