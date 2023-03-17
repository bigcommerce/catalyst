import { gql } from '@apollo/client';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import React from 'react';
import { MergeDeep } from 'type-fest';

import { Link } from '../../reactant/components/Link';
import { serverClient } from '../client/server';
import { Footer, query as FooterQuery, FooterSiteQuery } from '../components/Footer';
import { Header, query as HeaderQuery, HeaderSiteQuery } from '../components/Header';
import { ProductTiles } from '../components/ProductTiles';

export interface Product {
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
}

interface ProductConnection {
  edges: Product[];
}

interface HomePageQuery {
  site: MergeDeep<
    MergeDeep<HeaderSiteQuery, FooterSiteQuery>,
    {
      featuredProducts: ProductConnection;
      bestSellingProducts: ProductConnection;
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

export const getServerSideProps: GetServerSideProps = async () => {
  const { data } = await serverClient.query<HomePageQuery>({
    query: gql`
      query HomePageQuery($pageSize: Int = 4) {
      site {
        featuredProducts (first: $pageSize) {
          ...Product
        }
        bestSellingProducts (first: $pageSize) {
          ...Product
        }
        settings {
          storefront {
            catalog {
              productComparisonsEnabled
            }
          }
        }

        ...${HeaderQuery.fragmentName}
        ...${FooterQuery.fragmentName}
      }
    }

    fragment Product on ProductConnection {
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

    ${HeaderQuery.fragment}
    ${FooterQuery.fragment}
    `,
  });

  return {
    props: {
      data,
    },
  };
};

export default function HomePage({ data }: { data: HomePageQuery }) {
  return (
    <>
      <Head>
        <title>BigCommerce Swag Store</title>
        <meta content="BigCommerce Swag Store" name="description" />
      </Head>
      <Header categoryTree={data.site.categoryTree} settings={data.site.settings} />
      <main>
        <div className="md:container md:mx-auto">
          <div className="aspect-[9/16] md:aspect-[2/1] bg-slate-100 relative flex flex-col items-start justify-center p-6 sm:p-16 md:p-24">
            <h1 className="text-4xl font-black mb-4">New collection</h1>
            <p className="md:max-w-lg mb-10">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
            </p>
            <Link className="px-8 py-3 bg-[#053FB0] text-white font-semibold" href="/">
              Shop now
            </Link>
          </div>
          <ProductTiles
            priority
            productComparisonsEnabled={
              data.site.settings.storefront.catalog.productComparisonsEnabled
            }
            products={data.site.featuredProducts}
            title="Featured products"
          />
          <ProductTiles
            productComparisonsEnabled={
              data.site.settings.storefront.catalog.productComparisonsEnabled
            }
            products={data.site.bestSellingProducts}
            title="Popular products"
          />
        </div>
      </main>
      <Footer
        brands={data.site.brands}
        categoryTree={data.site.categoryTree}
        settings={data.site.settings}
      />
    </>
  );
}
