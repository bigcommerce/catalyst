import { GetServerSideProps } from 'next';
import Head from 'next/head';
import React from 'react';
import { MergeDeep } from 'type-fest';

import { getServerClient } from '@client/server';
import { gql } from '@client/utils';
import { Link } from '@reactant/components/Link';

import { Footer, query as FooterQuery, FooterSiteQuery } from '../components/Footer';
import { Header, query as HeaderQuery, HeaderSiteQuery } from '../components/Header';
import {
  ProductTiles,
  ProductTilesConnection,
  query as ProductTilesQuery,
} from '../components/ProductTiles';

interface HomePageQuery {
  site: MergeDeep<
    MergeDeep<HeaderSiteQuery, FooterSiteQuery>,
    {
      featuredProducts: ProductTilesConnection;
      bestSellingProducts: ProductTilesConnection;
      settings: {
        storeName: string;
        storefront: {
          catalog: {
            productComparisonsEnabled: boolean;
          };
        };
      };
    }
  >;
}

interface HomePageProps {
  homePage: {
    featuredProducts: ProductTilesConnection;
    bestSellingProducts: ProductTilesConnection;
    settings: {
      storeName: string;
      storefront: {
        catalog: {
          productComparisonsEnabled: boolean;
        };
      };
    };
  };
  header: HeaderSiteQuery;
  footer: FooterSiteQuery;
}

export const getServerSideProps: GetServerSideProps = async () => {
  const client = getServerClient();

  const [homePage, header, footer] = await Promise.all([
    client.query<HomePageQuery>({
      query: gql`
        query HomePageQuery($pageSize: Int = 4) {
        site {
          featuredProducts (first: $pageSize) {
            ...${ProductTilesQuery.fragmentName}
          }
          bestSellingProducts (first: $pageSize) {
            ...${ProductTilesQuery.fragmentName}
          }
          settings {
            storeName
            storefront {
              catalog {
                productComparisonsEnabled
              }
            }
          }
        }
      }

      ${ProductTilesQuery.fragment}
      `,
    }),
    client.query<HomePageQuery>({
      query: gql`
        query Header {
          site {
            ...${HeaderQuery.fragmentName}   
          }
        }
        ${HeaderQuery.fragment}
      `,
    }),
    client.query<HomePageQuery>({
      query: gql`
        query Footer {
          site {
            ...${FooterQuery.fragmentName}
          }
        }
        ${FooterQuery.fragment}
      `,
    }),
  ]);

  return {
    props: {
      homePage: homePage.data.site,
      header: header.data.site,
      footer: footer.data.site,
    },
  };
};

export default function HomePage({ homePage, header, footer }: HomePageProps) {
  return (
    <>
      <Head>
        <title>{homePage.settings.storeName}</title>
        <meta content={homePage.settings.storeName} name="description" />
      </Head>
      <Header categoryTree={header.categoryTree} settings={header.settings} />

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
              homePage.settings.storefront.catalog.productComparisonsEnabled
            }
            products={homePage.featuredProducts}
            title="Featured products"
          />
          <ProductTiles
            productComparisonsEnabled={
              homePage.settings.storefront.catalog.productComparisonsEnabled
            }
            products={homePage.bestSellingProducts}
            title="Popular products"
          />
        </div>
      </main>

      <Footer
        brands={footer.brands}
        categoryTree={footer.categoryTree}
        settings={footer.settings}
      />
    </>
  );
}
