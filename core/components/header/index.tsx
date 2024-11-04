import { getFormatter, getLocale, getTranslations } from 'next-intl/server';

import { Navigation } from '@/vibes/soul/primitives/navigation';
import { SearchResult } from '@/vibes/soul/primitives/navigation/search-results';
import { LayoutQuery } from '~/app/[locale]/(default)/query';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { readFragment } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { ExistingResultType } from '~/client/util';
import { logoTransformer } from '~/data-transformers/logo-transformer';
import { pricesTransformer } from '~/data-transformers/prices-transformer';
import { localeLanguageRegionMap } from '~/i18n/routing';

import { getSearchResults } from './_actions/get-search-results';
import { HeaderFragment } from './fragment';

type QuickSearchResults = ExistingResultType<typeof getSearchResults>;

const isSearchQuery = (data: unknown): data is QuickSearchResults => {
  if (typeof data === 'object' && data !== null && 'products' in data) {
    return true;
  }

  return false;
};

const fetchSearchResults = async (term: string): Promise<SearchResult[]> => {
  'use server';

  const format = await getFormatter();
  const { data: searchResults } = await getSearchResults(term);

  if (isSearchQuery(searchResults) && searchResults.products.length > 0) {
    return [
      {
        type: 'links',
        title: 'Categories',
        links:
          searchResults.products.length > 0
            ? Object.entries(
                searchResults.products.reduce<Record<string, string>>((categories, product) => {
                  product.categories.edges?.forEach((category) => {
                    categories[category.node.name] = category.node.path;
                  });

                  return categories;
                }, {}),
              ).map(([name, path]) => {
                return { label: name, href: path };
              })
            : [],
      },
      {
        type: 'links',
        title: 'Brands',
        links:
          searchResults.products.length > 0
            ? Object.entries(
                searchResults.products.reduce<Record<string, string>>((brands, product) => {
                  if (product.brand) {
                    brands[product.brand.name] = product.brand.path;
                  }

                  return brands;
                }, {}),
              ).map(([name, path]) => {
                return { label: name, href: path };
              })
            : [],
      },
      {
        type: 'products',
        title: 'Products',
        products: searchResults.products.map((product) => {
          const price = pricesTransformer(product.prices, format);

          return {
            id: product.entityId.toString(),
            title: product.name,
            href: product.path,
            image: product.defaultImage
              ? { src: product.defaultImage.url, alt: product.defaultImage.altText }
              : undefined,
            price,
          };
        }),
      },
    ];
  }

  return [];
};

export const Header = async () => {
  const locale = await getLocale();
  const t = await getTranslations('Components.Header');
  const customerAccessToken = await getSessionCustomerAccessToken();

  const { data: response } = await client.fetch({
    document: LayoutQuery,
    fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
  });

  const data = readFragment(HeaderFragment, response).site;

  /**  To prevent the navigation menu from overflowing, we limit the number of categories to 6.
   To show a full list of categories, modify the `slice` method to remove the limit.
   Will require modification of navigation menu styles to accommodate the additional categories.
   */
  const categoryTree = data.categoryTree.slice(0, 6);

  const links = categoryTree.map(({ name, path, children }) => ({
    label: name,
    href: path,
    groups: children.map((firstChild) => ({
      label: firstChild.name,
      href: firstChild.path,
      links: firstChild.children.map((secondChild) => ({
        label: secondChild.name,
        href: secondChild.path,
      })),
    })),
  }));

  return (
    <Navigation
      accountHref="/account"
      activeLocale={locale}
      cartHref="/cart"
      links={links}
      locales={localeLanguageRegionMap}
      logo={data.settings ? logoTransformer(data.settings) : undefined}
      searchAction={fetchSearchResults}
      searchCtaLabel={t('viewAll')}
      searchHref="/search"
    />
  );
};
