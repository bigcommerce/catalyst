'use client';

import { useFormatter } from 'next-intl';

import { ExistingResultType } from '~/client/util';
import { pricesTransformer } from '~/data-transformers/prices-transformer';

import { Search } from '../ui/header';

import { getSearchResults } from './_actions/get-search-results';

interface Image {
  src: string;
  altText: string;
}

interface SearchProps {
  logo: string | Image;
}

type QuickSearchResults = ExistingResultType<typeof getSearchResults>;

const isSearchQuery = (data: unknown): data is QuickSearchResults => {
  if (typeof data === 'object' && data !== null && 'products' in data) {
    return true;
  }

  return false;
};

export const QuickSearch = ({ logo }: SearchProps) => {
  const format = useFormatter();

  const fetchSearchResults = async (term: string) => {
    const { data: searchResults } = await getSearchResults(term);

    if (isSearchQuery(searchResults)) {
      return {
        products: searchResults.products.map((product) => {
          const price = pricesTransformer(product.prices, format);

          return {
            name: product.name,
            href: product.path,
            image: product.defaultImage
              ? { src: product.defaultImage.url, altText: product.defaultImage.altText }
              : undefined,
            price,
          };
        }),
        categories:
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
        brands:
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
      };
    }

    return null;
  };

  return <Search logo={logo} onSearch={fetchSearchResults} />;
};
