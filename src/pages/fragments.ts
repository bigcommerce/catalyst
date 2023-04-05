import { query as ProductTilesQuery } from '../components/ProductTiles';

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

export const physicalItemsFragment = {
  fragment: `fragment physicalItem on CartPhysicalItem {
		  entityId
		  parentEntityId
		  variantEntityId
		  productEntityId
		  sku
		  name
		  url
		  imageUrl
		  brand
		  quantity
		  isTaxable
		  discounts {
			entityId
			discountedAmount {
			  currencyCode
			  value
			}
		  }
		  discountedAmount {
			currencyCode
			value
		  }
		  couponAmount {
			currencyCode
			value
		  }
		  listPrice {
			currencyCode
			value
		  }
		  originalPrice {
			currencyCode
			value
		  }
		  salePrice {
			currencyCode
			value
		  }
		  extendedListPrice {
			currencyCode
			value
		  }
		  extendedSalePrice {
			currencyCode
			value
		  }
		  isShippingRequired
		  selectedOptions {
			entityId
			name
			... on CartSelectedCheckboxOption {
			  value
			  valueEntityId
			}
			... on CartSelectedDateFieldOption {
			  date {
				utc
			  }
			}
			... on CartSelectedFileUploadOption {
			  fileName
			}
			... on CartSelectedMultiLineTextFieldOption {
			  text
			}
			... on CartSelectedMultipleChoiceOption {
			  value
			  valueEntityId
			}
			... on CartSelectedNumberFieldOption {
			  number
			}
			... on CartSelectedTextFieldOption {
			  text
			}
		  }
		  giftWrapping {
			name
			amount {
			  currencyCode
			  value
			}
			message
		  }
		}`,
  fragmentName: 'physicalItem',
};
