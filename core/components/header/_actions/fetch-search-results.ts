'use server';

import { getFormatter } from 'next-intl/server';

import { SearchResult } from '@/vibes/soul/primitives/navigation/search-results';
import { pricesTransformer } from '~/data-transformers/prices-transformer';

import { getSearchResults } from './get-search-results';
import { ExistingResultType } from '~/client/util';

type QuickSearchResults = ExistingResultType<typeof getSearchResults>;

const isSearchQuery = (data: unknown): data is QuickSearchResults => {
  if (typeof data === 'object' && data !== null && 'products' in data) {
    return true;
  }

  return false;
};

export const fetchSearchResults = async (term: string): Promise<SearchResult[]> => {
  const format = await getFormatter();
  const { data: searchResults } = await getSearchResults(term);

  if (isSearchQuery(searchResults) && searchResults.products.length > 0) {
    return [
      {
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
