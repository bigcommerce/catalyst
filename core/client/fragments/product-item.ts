import { graphql } from '~/client/graphql';
import { BreadcrumbsFragment } from '~/components/breadcrumbs';
import { ProductFormFragment } from '~/components/product-form/fragment';

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
      prices {
        priceRange {
          min {
            value
          }
          max {
            value
          }
        }
        retailPrice {
          value
        }
        salePrice {
          value
        }
        basePrice {
          value
        }
        price {
          value
          currencyCode
        }
      }
      ...ProductFormFragment
    }
  `,
  [BreadcrumbsFragment, ProductFormFragment],
);
