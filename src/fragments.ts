import { query as ProductTilesQuery } from './components/ProductTiles';

const CategoryFiltersQuery = {
  fragmentName: 'PageFilters',
  fragment: /* GraphQL */ `
    fragment PageFilters on SearchProductFilterConnection {
      edges {
        node {
          __typename
          name
          isCollapsedByDefault

          ... on BrandSearchFilter {
            name
            isCollapsedByDefault
            displayProductCount
            brands {
              edges {
                node {
                  entityId
                  name
                  isSelected
                  productCount
                }
              }
            }
          }

          ... on OtherSearchFilter {
            name
            isCollapsedByDefault
            displayProductCount
            freeShipping {
              isSelected
              productCount
            }
            isInStock {
              isSelected
              productCount
            }
            isFeatured {
              isSelected
              productCount
            }
          }
        }
      }
    }
  `,
};

export const queryForward = {
  fragmentName: 'SearchForwardQuery',
  fragment: /* GraphQL */ `
    fragment SearchForwardQuery on Site {
      search {
        searchProducts(
          filters: {
            brandEntityIds: $brandIds
            categoryEntityId: $categoryId
            isFreeShipping: $isFreeShipping
            isFeatured: $isFeatured
            hideOutOfStock: $hideOutOfStock
          }
        ) {
          products(first: $perPage, after: $cursor) {
             ...${ProductTilesQuery.fragmentName}
          }
          filters {
            ...${CategoryFiltersQuery.fragmentName}
          }
        }
      }
    }

    ${ProductTilesQuery.fragment}
    ${CategoryFiltersQuery.fragment}
  `,
};

// NOTE: now it's not suported but can't be used later
export const queryBack = {
  fragmentName: 'SearchBackQuery',
  fragment: /* GraphQL */ `
    fragment SearchBackQuery on Site {
      search {
        searchProducts(
          filters: {
            brandEntityIds: $brandIds
            categoryEntityId: $categoryId
            isFreeShipping: $isFreeShipping
            isFeatured: $isFeatured
            hideOutOfStock: $hideOutOfStock
          }
        ) {
          products(last: $perPage, before: $cursor) {
            ...${ProductTilesQuery.fragmentName}
          }
          filters {
            ...${CategoryFiltersQuery.fragmentName}
          }
        }
      }
    }

    ${ProductTilesQuery.fragment}
    ${CategoryFiltersQuery.fragment}
  `,
};
