import React from 'react';

import { Variant } from '../pages/product/[pid]';

import { ProductTileWrapper } from './ProductTileWrapper';

interface PageInfo {
  endCursor: string;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string;
}

export interface Product {
  node: {
    variants: {
      edges: Variant[];
    };
    productOptions: {
      edges: Array<{
        node: {
          entityId: number;
          displayName: string;
          isRequired: boolean;
          __typename: string;
          displayStyle: string;
          values: {
            edges: Array<{
              node: {
                entityId: number;
                label: string;
                isDefault: boolean;
                hexColors: string[];
                imageUrl: string | null;
                isSelected: boolean;
                __typename: string;
              };
            }>;
          };
        };
      }>;
    };
    entityId: number;
    name: string;
    defaultImage: {
      url: string;
      altText: string;
    } | null;
    prices: {
      price: {
        formatted: string;
      } | null;
    };
    brand: {
      name: string;
    } | null;
    path: string;
    addToCartUrl: string;
    showCartAction: boolean;
  };
}

export interface ProductTilesConnection {
  pageInfo: PageInfo;
  edges: Product[];
}

export const query = {
  fragmentName: 'ProductTilesQuery',
  fragment: /* GraphQL */ `
    fragment ProductTilesQuery on ProductConnection {
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
      edges {
        node {
          addToCartUrl
          entityId
          name
          path
          showCartAction
          brand {
            name
          }
          defaultImage {
            url(width: 300, height: 300)
            altText
          }
          prices(currencyCode: UAH) {
            price {
              formatted
            }
          }
          productOptions(first: 3) {
            edges {
              node {
                entityId
                displayName
                isRequired
                __typename
                ... on MultipleChoiceOption {
                  displayStyle
                  values(first: 5) {
                    edges {
                      node {
                        entityId
                        isDefault
                        ... on SwatchOptionValue {
                          hexColors
                          imageUrl(width: 200)
                          isSelected
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          variants(first: 5) {
            edges {
              node {
                defaultImage {
                  url(width: 1000)
                  altText
                }
                prices {
                  price {
                    formatted
                  }
                }
                options(first: 5) {
                  edges {
                    node {
                      values(first: 5) {
                        edges {
                          node {
                            entityId
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
};

interface ProductTilesProps {
  cols?: keyof typeof COLS;
  title?: string;
  priority?: boolean;
  // TODO: See if we can make this more generic
  products: ProductTilesConnection;
  productComparisonsEnabled: boolean;
}

const COLS = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
};

export const ProductTiles = ({
  cols = 4,
  title,
  priority = false,
  products,
  productComparisonsEnabled,
}: ProductTilesProps) => {
  return (
    <div className="my-12 mx-6 sm:mx-10 md:mx-auto">
      {title ? <h2 className="font-black text-4xl mb-10">{title}</h2> : null}
      <ul className={`grid grid-cols-2 gap-6 ${COLS[cols]} md:gap-8`}>
        {products.edges.map((product: Product) => (
          <ProductTileWrapper
            key={product.node.entityId}
            priority={priority}
            product={product}
            productComparisonsEnabled={productComparisonsEnabled}
          />
        ))}
      </ul>
    </div>
  );
};
