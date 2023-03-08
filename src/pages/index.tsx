import { gql } from '@apollo/client';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import React from 'react';

import { Link } from '../../reactant/components/Link';
import { serverClient } from '../client/server';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import type { StoreLogo } from '../components/Header';
import { ProductTiles } from '../components/ProductTiles';

export interface Brands {
  edges: Array<{
    node: {
      name: string;
      path: string;
    };
  }>;
}

export interface CategoryTree {
  name: string;
  path: string;
  children?: CategoryTree[];
}

export interface Contact {
  address: string;
  phone: string;
}

export interface SocialMediaLink {
  name: string;
  url: string;
}

interface ProductConnection {
  edges: Array<{
    node: {
      entityId: number;
      name: string;
      path: string;
      brand: {
        name: string;
      } | null;
      defaultImage: {
        url: string;
        altText: string;
      };
      prices: {
        price: {
          formatted: string;
        } | null;
      };
    };
  }>;
}

interface HomePageQuery {
  site: {
    featuredProducts: ProductConnection;
    bestSellingProducts: ProductConnection;
    categoryTree: CategoryTree[];
    brands: Brands;
    settings: {
      storeName: string;
      storefront: {
        catalog: {
          productComparisonsEnabled: boolean;
        };
      };
      logoV2: StoreLogo;
      contact: Contact;
      socialMediaLinks: SocialMediaLink[];
    };
  };
}

export const getServerSideProps: GetServerSideProps = async () => {
  const { data } = await serverClient.query<HomePageQuery>({
    query: gql`
      query HomePageQuery($pageSize: Int = 4) {
        site {
          featuredProducts(first: $pageSize) {
            ...Product
          }
          bestSellingProducts(first: $pageSize) {
            ...Product
          }
          brands {
            edges {
              node {
                name
                path
              }
            }
          }
          categoryTree {
            ...Category
            children {
              ...Category
              children {
                ...Category
              }
            }
          }
          settings {
            storeName
            storefront {
              catalog {
                productComparisonsEnabled
              }
            }
            logoV2 {
              __typename
              ... on StoreTextLogo {
                text
              }
              ... on StoreImageLogo {
                image {
                  url(width: 155)
                  altText
                }
              }
            }
            contact {
              address
              phone
            }
            socialMediaLinks {
              name
              url
            }
          }
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
          }
        }
      }
      fragment Category on CategoryTreeItem {
        name
        path
      }
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
      <Header
        categories={data.site.categoryTree}
        logo={data.site.settings.logoV2}
        storeName={data.site.settings.storeName}
      />
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
        contact={data.site.settings.contact}
        logo={data.site.settings.logoV2}
        socialMediaLinks={data.site.settings.socialMediaLinks}
        storeName={data.site.settings.storeName}
      />
    </>
  );
}
