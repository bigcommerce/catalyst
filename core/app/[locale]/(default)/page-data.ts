import { unstable_cache } from 'next/cache';
import { cache } from 'react';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { FeaturedProductsCarouselFragment } from '~/components/featured-products-carousel/fragment';
import { FeaturedProductsListFragment } from '~/components/featured-products-list/fragment';
import { FooterFragment, FooterSectionsFragment } from '~/components/footer/fragment';
import { CurrencyCode, HeaderFragment, HeaderLinksFragment } from '~/components/header/fragment';

export const LayoutQuery = graphql(
  `
    query LayoutQuery {
      site {
        ...HeaderFragment
        ...FooterFragment
      }
    }
  `,
  [HeaderFragment, FooterFragment],
);

const GiftCertificatesEnabledFragment = graphql(`
  fragment GiftCertificatesEnabledFragment on Settings {
    giftCertificates(currencyCode: $currencyCode) {
      isEnabled
    }
  }
`);

export const GetLinksAndSectionsQuery = graphql(
  `
    query GetLinksAndSectionsQuery($currencyCode: currencyCode) {
      site {
        settings {
          ...GiftCertificatesEnabledFragment
        }
        ...HeaderLinksFragment
        ...FooterSectionsFragment
      }
    }
  `,
  [HeaderLinksFragment, FooterSectionsFragment, GiftCertificatesEnabledFragment],
);

const HomePageQuery = graphql(
  `
    query HomePageQuery($currencyCode: currencyCode) {
      site {
        featuredProducts(first: 12) {
          edges {
            node {
              ...FeaturedProductsListFragment
            }
          }
        }
        newestProducts(first: 12) {
          edges {
            node {
              ...FeaturedProductsCarouselFragment
            }
          }
        }
        settings {
          inventory {
            defaultOutOfStockMessage
            showOutOfStockMessage
            showBackorderMessage
          }
          newsletter {
            showNewsletterSignup
          }
        }
      }
    }
  `,
  [FeaturedProductsCarouselFragment, FeaturedProductsListFragment],
);

const getCachedPageData = unstable_cache(
  async (locale: string, currencyCode?: CurrencyCode) => {
    const { data } = await client.fetch({
      document: HomePageQuery,
      variables: { currencyCode },
      locale,
      fetchOptions: { cache: 'no-store' },
    });

    return data;
  },
  ['home-page-data'],
  { revalidate },
);

export const getPageData = cache(
  async (locale: string, currencyCode?: CurrencyCode, customerAccessToken?: string) => {
    if (customerAccessToken) {
      const { data } = await client.fetch({
        document: HomePageQuery,
        customerAccessToken,
        variables: { currencyCode },
        locale,
        fetchOptions: { cache: 'no-store' },
      });

      return data;
    }

    return getCachedPageData(locale, currencyCode);
  },
);
