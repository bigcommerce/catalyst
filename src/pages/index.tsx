import { GetServerSideProps } from 'next';
import Head from 'next/head';
import React, { Fragment } from 'react';

import { Button } from '../../reactant/components/Button';
import { Link } from '../../reactant/components/Link';
import { FacebookIcon } from '../../reactant/icons/Facebook';
import { HeartIcon } from '../../reactant/icons/Heart';
import { PinterestIcon } from '../../reactant/icons/Pinterest';
import { TwitterIcon } from '../../reactant/icons/Twitter';
import { http } from '../client';
import { FooterMenu } from '../components/FooterMenu';
import { Header } from '../components/Header';
import type { StoreLogo } from '../components/Header';
import { BaseStoreLogo } from '../components/Logo';
import { ProductTiles } from '../components/ProductTiles';

interface CategoryTree {
  name: string;
  path: string;
  children?: CategoryTree[];
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
      brands: {
        edges: Array<{
          node: {
            name: string;
            path: string;
          };
        }>;
      };
      settings: {
        storeName: string;
        logoV2: StoreLogo;
        contact: {
          address: string;
          phone: string;
        };
        socialMediaLinks: Array<{
          name: string;
          url: string;
        }>;
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
      <footer>
        <div className="border-t border-b border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-6 gap-8 my-12 mx-6 sm:mx-10 md:container md:mx-auto">
            <div>
              <FooterMenu items={data.site.categoryTree} title="Categories" />
            </div>
            <div>
              <FooterMenu
                items={data.site.brands.edges.map(({ node }) => ({ ...node }))}
                title="Brands"
              />
            </div>
            <div>
              <FooterMenu
                items={[
                  { name: 'Contact us', path: '/contact-us' },
                  { name: 'About brand', path: '/about' },
                  { name: 'Blog', path: '/blog' },
                ]}
                title="About us"
              />
            </div>
            <div>
              <FooterMenu
                items={[
                  { name: 'Shipping & returns', path: '/shipping-and-returns' },
                  { name: 'Privacy policy', path: '/privacy-policy' },
                  { name: 'Terms & conditions', path: '/terms-and-conditions' },
                  { name: 'FAQ', path: '/faq' },
                ]}
                title="Help"
              />
            </div>
            <div className="sm:col-span-2 md:order-first">
              <h4 className="mb-4">
                <BaseStoreLogo
                  logo={data.site.settings.logoV2}
                  storeName={data.site.settings.storeName}
                />
              </h4>
              <address className="mb-2 not-italic">
                {data.site.settings.contact.address.split('\n').map((line) => (
                  <Fragment key={line}>
                    {line}
                    <br />
                  </Fragment>
                ))}
              </address>
              {data.site.settings.contact.phone ? <p>{data.site.settings.contact.phone}</p> : null}
              {data.site.settings.socialMediaLinks.length > 0 ? (
                <ul className="flex flex-wrap gap-4 mt-8">
                  {data.site.settings.socialMediaLinks.map((link) => (
                    <li key={link.name}>
                      <Link className={Link.iconOnly.className}>
                        {link.name === 'Facebook' && (
                          <FacebookIcon className={Link.Icon.className} />
                        )}
                        {link.name === 'Twitter' && <TwitterIcon className={Link.Icon.className} />}
                        {link.name === 'Pinterest' && (
                          <PinterestIcon className={Link.Icon.className} />
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 my-8 md:my-6 mx-6 sm:mx-10 md:container md:mx-auto">
          <div className="md:text-right">Payment methods</div>
          <div className="md:order-first">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} {data.site.settings.storeName} – Powered by BigCommerce
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
