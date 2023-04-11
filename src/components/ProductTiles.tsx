import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { Button } from '@reactant/components/Button';
import { Link as ReactantLink } from '@reactant/components/Link';
import { H3, P, ProductTile } from '@reactant/components/ProducTile';
import { Swatch, SwatchGroup } from '@reactant/components/Swatch';
import { HeartIcon } from '@reactant/icons/Heart';

interface PageInfo {
  endCursor: string;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string;
}

export interface ProductTilesConnection {
  pageInfo: PageInfo;
  edges: Array<{
    node: {
      addToCartUrl: string;
      showCartAction: boolean;
      entityId: number;
      name: string;
      path: string;
      brand: {
        name: string;
      } | null;
      defaultImage?: {
        url: string;
        altText: string;
      };
      prices: {
        price: {
          formatted: string;
        } | null;
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
                };
              }>;
            };
          };
        }>;
      };
    };
  }>;
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
          prices(currencyCode: USD) {
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
        {products.edges.map((edge) => (
          <li key={`featured-${edge.node.entityId}`}>
            <ProductTile className={ProductTile.default.className}>
              <ProductTile.Figure className={ProductTile.Figure.default.className}>
                <Link className="block relative" href={edge.node.path}>
                  <Image
                    alt={edge.node.defaultImage?.altText || 'Product image'}
                    className="mb-5 aspect-square w-full"
                    height={320}
                    priority={priority}
                    src={edge.node.defaultImage?.url || '/'}
                    width={320}
                  />
                </Link>
                <ProductTile.FigCaption className={ProductTile.FigCaption.default.className}>
                  <div>
                    {productComparisonsEnabled && (
                      <Button className={Button.secondary.className}>Compare products</Button>
                    )}
                  </div>
                </ProductTile.FigCaption>
              </ProductTile.Figure>
              <ProductTile.Body className={ProductTile.Body.default.className}>
                <div className="py-2">
                  {edge.node.productOptions.edges.map(({ node: options }) => {
                    if (
                      options.__typename === 'MultipleChoiceOption' &&
                      options.displayStyle === 'Swatch'
                    ) {
                      return (
                        <SwatchGroup
                          className={SwatchGroup.default.className}
                          key={options.entityId}
                        >
                          {options.values.edges.map(({ node: variant }) => (
                            <Swatch className={Swatch.default.className} key={variant.entityId}>
                              <Swatch.Label
                                className={Swatch.Label.default.className}
                                title={variant.label}
                              >
                                <Swatch.Variant
                                  className={`${Swatch.Variant.default.className} ${
                                    variant.imageUrl ? `bg-center bg-no-repeat` : ''
                                  }`}
                                  variantColor={variant.hexColors[0] ?? variant.imageUrl}
                                />
                              </Swatch.Label>
                              <Swatch.Input
                                aria-label={variant.label}
                                className={Swatch.Input.default.className}
                                name={`${variant.entityId}`}
                                type="radio"
                                value={variant.entityId}
                              />
                            </Swatch>
                          ))}
                        </SwatchGroup>
                      );
                    }

                    return false;
                  })}
                  <P className={`${P.default.className} text-[#546E7A]`}>{edge.node.brand?.name}</P>
                  <H3 className={`${H3.default.className}  hover:text-[#053FB0]`}>
                    <Link href={edge.node.path}>{edge.node.name}</Link>
                  </H3>
                </div>
                <div className="card-text relative py-1 flex items-center gap-2">
                  <P className={P.default.className}>{edge.node.prices.price?.formatted}</P>
                </div>
                <div className="absolute z-10 hidden flex-row justify-start pt-4 gap-x-4 group-hover/cardBody:inline-flex">
                  {edge.node.showCartAction && (
                    <ReactantLink
                      className={`${ReactantLink.text.className} ${Button.primary.className} hover:!text-white hover:!bg-[#3071EF]`}
                      href={edge.node.addToCartUrl}
                    >
                      Add to cart
                    </ReactantLink>
                  )}
                  <Button className={`${Button.primary.className} ${Button.iconOnly.className}`}>
                    <HeartIcon />
                  </Button>
                </div>
              </ProductTile.Body>
            </ProductTile>
          </li>
        ))}
      </ul>
    </div>
  );
};
