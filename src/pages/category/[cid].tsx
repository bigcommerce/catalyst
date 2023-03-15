import { gql } from '@apollo/client';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { MergeDeep } from 'type-fest';

import { Button } from '../../../reactant/components/Button';
import { Link as ReactantLink } from '../../../reactant/components/Link';
import { H3, P, ProductTile } from '../../../reactant/components/ProducTile';
import { Swatch, SwatchGroup } from '../../../reactant/components/Swatch';
import { HeartIcon } from '../../../reactant/icons/Heart';
import { serverClient } from '../../client/server';
import { Header, query as HeaderQuery, HeaderSiteQuery } from '../../components/Header';
import type { StoreLogo } from '../../components/Header';

interface Category {
  name: string;
  path: string;
  breadcrumbs: {
    edges: Array<{
      node: {
        entityId: number;
        name: string;
      };
    }>;
  };
  products: {
    edges: Array<{
      node: {
        id: string;
        addToCartUrl: string;
        name: string;
        path: string;
        defaultImage: {
          url: string;
          altText: string;
        } | null;
        brand: {
          name: string;
        } | null;
        showCartAction: boolean;
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
  };
}

interface CategoryTree {
  name: string;
  path: string;
  children?: CategoryTree[];
}

interface CategoryQuery {
  site: MergeDeep<
    HeaderSiteQuery,
    {
      category: Category | null;
      settings: {
        storefront: {
          catalog: {
            productComparisonsEnabled: boolean;
          };
        };
      };
    }
  >;
}

interface CategoryPageProps {
  category: Category;
  categories: CategoryTree[];
  storeName: string;
  logo: StoreLogo;
  storefront: {
    catalog: {
      productComparisonsEnabled: boolean;
    };
  };
}

interface CategoryPageParams {
  [key: string]: string | string[] | undefined;
  cid: string;
}

export const getServerSideProps: GetServerSideProps<
  CategoryPageProps,
  CategoryPageParams
> = async ({ params }) => {
  if (!params?.cid) {
    return {
      notFound: true,
    };
  }

  const categoryId = parseInt(params.cid, 10);

  const { data } = await serverClient.query<CategoryQuery>({
    query: gql`
    query category($categoryId: Int!, $perPage: Int = 9) {
      site {
        category(entityId: $categoryId) {
          name
          path
          breadcrumbs(depth: 1) {
            edges {
              node {
                entityId
                name
              }
            }
          }
          products(first: $perPage) {
            edges {
              node {
                id
                addToCartUrl
                path
                name
                defaultImage {
                  url: url(width: 300)
                  altText
                }
                showCartAction
                brand {
                  name
                }
                prices {
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
        }
        settings {
          storefront {
            catalog {
              productComparisonsEnabled
            }
          }
        }

        ...${HeaderQuery.fragmentName}
      }
    }

    ${HeaderQuery.fragment}
    `,
    variables: { categoryId },
  });

  if (data.site.category == null) {
    return { notFound: true };
  }

  return {
    props: {
      category: data.site.category,
      categories: data.site.categoryTree,
      storeName: data.site.settings.storeName,
      logo: data.site.settings.logoV2,
      storefront: data.site.settings.storefront,
    },
  };
};

// TODO: Re-type with similar method to HomePage
export default function CategoryPage({
  category,
  categories,
  storeName,
  storefront,
  logo,
}: CategoryPageProps) {
  return (
    <>
      <Head>
        <title>{category.name}</title>
      </Head>
      <Header categoryTree={categories} settings={{ logoV2: logo, storeName }} />
      <main>
        <div className="md:container md:mx-auto">
          <h1 className="font-black text-5xl leading-[4rem]">{category.name}</h1>
          <div className="grid grid-cols-4">
            <div className="col-span-1" />
            <div className="col-span-3">
              <ul className="grid grid-cols-2 md:grid-cols-3 grid-flow-cols gap-8">
                {category.products.edges.map(({ node }) => (
                  <li className="basis-1/3" key={node.id}>
                    <ProductTile className={ProductTile.default.className}>
                      <ProductTile.Figure className={ProductTile.Figure.default.className}>
                        <Link className="block relative" href={node.path}>
                          <Image
                            alt={node.defaultImage?.altText || 'Product image'}
                            className="mb-5 aspect-square w-full"
                            height={320}
                            priority={false}
                            src={node.defaultImage?.url || '/'}
                            width={320}
                          />
                        </Link>
                        <ProductTile.FigCaption
                          className={ProductTile.FigCaption.default.className}
                        >
                          <div>
                            {storefront.catalog.productComparisonsEnabled && (
                              <Button className={Button.secondary.className}>
                                Compare products
                              </Button>
                            )}
                          </div>
                        </ProductTile.FigCaption>
                      </ProductTile.Figure>
                      <ProductTile.Body className={ProductTile.Body.default.className}>
                        <div className="py-2">
                          {node.productOptions.edges.map(({ node: options }) => {
                            if (
                              options.__typename === 'MultipleChoiceOption' &&
                              options.displayStyle === 'Swatch'
                            ) {
                              return (
                                <SwatchGroup
                                  className={SwatchGroup.default.className}
                                  key={options.entityId}
                                  role="radiogroup"
                                >
                                  {options.values.edges.map(({ node: variant }) => (
                                    <Swatch
                                      className={Swatch.default.className}
                                      key={variant.entityId}
                                    >
                                      <Swatch.Label
                                        className={Swatch.Label.default.className}
                                        title={variant.label}
                                      >
                                        <Swatch.Variant
                                          className={Swatch.Variant.default.className}
                                          variantColor={variant.hexColors[0]}
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
                          <P className={`${P.default.className} text-[#546E7A]`}>
                            {node.brand?.name}
                          </P>
                          <H3 className={`${H3.default.className}  hover:text-[#053FB0]`}>
                            <Link href={node.path}>{node.name}</Link>
                          </H3>
                        </div>
                        <div className="card-text relative py-1 flex items-center gap-2">
                          <P className={P.default.className}>{node.prices.price?.formatted}</P>
                        </div>
                        <div className="absolute hidden flex-row justify-start pt-4 gap-x-4 group-hover/cardBody:inline-flex">
                          {node.showCartAction && (
                            <ReactantLink
                              className={`${ReactantLink.text.className} ${Button.primary.className} z-10 hover:!text-white hover:!bg-[#3071EF]`}
                              href={node.addToCartUrl}
                            >
                              Add to cart
                            </ReactantLink>
                          )}
                          <Button
                            className={`${Button.primary.className} ${Button.iconOnly.className} z-10`}
                          >
                            <HeartIcon />
                          </Button>
                        </div>
                      </ProductTile.Body>
                    </ProductTile>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
