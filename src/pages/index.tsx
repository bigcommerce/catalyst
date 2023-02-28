import { GetServerSideProps } from 'next';
import Head from 'next/head';
import React from 'react';

import { Button } from '../../reactant/components/Button';
import { Link } from '../../reactant/components/Link';
import { HeartIcon } from '../../reactant/icons/Heart';
import { http } from '../client';
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
  data: {
    site: {
      featuredProducts: ProductConnection;
      bestSellingProducts: ProductConnection;
      categoryTree: CategoryTree[];
      brands: Brands;
      settings: {
        storeName: string;
        logoV2: StoreLogo;
        contact: Contact;
        socialMediaLinks: SocialMediaLink[];
      };
    };
  };
}

export const getServerSideProps: GetServerSideProps = async () => {
  const { data } = await http.query<HomePageQuery>(
    `
    query HomePageQuery($pageSize: Int = 4) {
      site {
        featuredProducts (first: $pageSize) {
          ...Product
        }
        bestSellingProducts (first: $pageSize) {
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
          logoV2 {
            __typename
            ... on StoreTextLogo{
              text
            }
            ... on StoreImageLogo{
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
          socialMediaLinks{
            name
            url
          }
        }
      }
    }

    fragment Product on ProductConnection {
      edges {
        node {
          entityId
          name
          path
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
  );

  return {
    props: {
      data,
    },
  };
};

export default function HomePage({ data }: { data: HomePageQuery['data'] }) {
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
          <ProductTiles priority products={data.site.featuredProducts} title="Featured products" />
          <ProductTiles products={data.site.bestSellingProducts} title="Popular products" />
        </div>
        {/* NOTE: temporary for testing purpose */}
        <div className="flex flex-row flex-wrap justify-start gap-4 m-4">
          <Button className={Button.primary.className}>Add to cart</Button>
          <Button className={Button.primary.className}>
            <HeartIcon className={Button.Icon.className} /> Add to cart
          </Button>
          <Button className={`${Button.primary.className} ${Button.iconOnly.className}`}>
            <HeartIcon />
          </Button>
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
