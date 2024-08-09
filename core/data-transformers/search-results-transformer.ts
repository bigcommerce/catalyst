import { getFormatter } from 'next-intl/server';

import { ExistingResultType } from '~/client/util';
import { getSearchResults } from '~/components/header/_actions/get-search-results';

import { pricesTransformer } from './prices-transformer';

export const searchResultsTransformer = (
  searchResults: NonNullable<ExistingResultType<typeof getSearchResults>['data']>,
  format: ExistingResultType<typeof getFormatter>,
) => ({
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
});
