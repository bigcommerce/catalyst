'use client';

import { useFormatter } from 'next-intl';
import { ReactNode } from 'react';

import { getQuickSearchResults } from '~/client/queries/get-quick-search-results';
import { ExistingResultType } from '~/client/util';

import { Price, Search, type SearchResults } from '../ui/search';

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

export const QuickSearch = ({ logo }: SearchProps) => {
  const format = useFormatter();

  const fetchSearchResults = async (
    term: string,
    setSearchResults: React.Dispatch<React.SetStateAction<SearchResults | null>>,
  ) => {
    const { data: searchResults } = await getSearchResults(term);

    const formatPrice = (prices: QuickSearchResults['products'][0]['prices']): Price | null => {
      if (!prices) {
        return null;
      }

      const isPriceRange = prices.priceRange.min.value !== prices.priceRange.max.value;
      const isSalePrice = prices.salePrice?.value !== prices.basePrice?.value;

      if (isPriceRange) {
        return {
          type: 'range',
          min: format.number(prices.priceRange.min.value, {
            style: 'currency',
            currency: prices.price.currencyCode,
          }),
          max: format.number(prices.priceRange.max.value, {
            style: 'currency',
            currency: prices.price.currencyCode,
          }),
        };
      }

      if (isSalePrice && prices.salePrice && prices.basePrice) {
        return {
          type: 'sale',
          originalAmount: format.number(prices.basePrice.value, {
            style: 'currency',
            currency: prices.price.currencyCode,
          }),
          amount: format.number(prices.salePrice.value, {
            style: 'currency',
            currency: prices.price.currencyCode,
          }),
          msrp:
            prices.retailPrice && prices.retailPrice.value !== prices.basePrice.value
              ? format.number(prices.retailPrice.value, {
                  style: 'currency',
                  currency: prices.price.currencyCode,
                })
              : undefined,
        };
      }

      return {
        type: 'fixed',
        amount: format.number(prices.price.value, {
          style: 'currency',
          currency: prices.price.currencyCode,
        }),
        msrp:
          prices.retailPrice && prices.retailPrice.value !== prices.price.value
            ? format.number(prices.retailPrice.value, {
                style: 'currency',
                currency: prices.price.currencyCode,
              })
            : undefined,
      };
    };

    if (isSearchQuery(searchResults)) {
      setSearchResults({
        products: searchResults.products.map((product) => {
          return {
            name: product.name,
            path: product.path,
            image: product.defaultImage ?? undefined,
            price: formatPrice(product.prices) ?? undefined,
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

  return <Search logo={logo} onSearch={fetchSearchResults} />;
};
