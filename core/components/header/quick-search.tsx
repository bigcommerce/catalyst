'use client';

import { ReactNode } from 'react';

import { getQuickSearchResults } from '~/client/queries/get-quick-search-results';
import { ExistingResultType } from '~/client/util';

import { Search, SearchResults } from '../ui/search';

import { getSearchResults } from './_actions/get-search-results';

interface SearchProps {
  logo: ReactNode;
}

type QuickSearchResults = ExistingResultType<typeof getQuickSearchResults>;

const isSearchQuery = (data: unknown): data is QuickSearchResults => {
  if (typeof data === 'object' && data !== null && 'products' in data) {
    return true;
  }

  return false;
};

const fetchSearchResults = async (
  term: string,
  setSearchResults: React.Dispatch<React.SetStateAction<SearchResults | null>>,
) => {
  const { data: searchResults } = await getSearchResults(term);

  if (isSearchQuery(searchResults)) {
    setSearchResults({
      products: searchResults.products.map((product) => ({
        name: product.name,
        path: product.path,
        image: product.defaultImage ?? undefined,
        price: { type: 'fixed', amount: '0' },
      })),
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
              return { name, path };
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
              return { name, path };
            })
          : [],
    });
  }
};

export const QuickSearch = ({ logo }: SearchProps) => {
  return <Search logo={logo} onSearch={fetchSearchResults} />;
};
