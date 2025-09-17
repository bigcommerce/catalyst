import { ResultOf } from 'gql.tada';
import { getFormatter, getTranslations } from 'next-intl/server';

import { SearchResult } from '@/vibes/soul/primitives/navigation';
import { SearchProductFragment } from '~/components/header/_actions/fragment';

import { pricesTransformer } from './prices-transformer';

export async function searchResultsTransformer(
  searchProducts: Array<ResultOf<typeof SearchProductFragment>>,
): Promise<SearchResult[]> {
  const format = await getFormatter();
  const t = await getTranslations('Components.Header.Search');

  const productResults = {
    type: 'products' as const,
    title: t('products'),
    products: searchProducts.map((product) => {
      const price = pricesTransformer(
        {
          pricesIncTax: product.pricesIncTax,
          pricesExcTax: product.pricesExcTax,
        },
        'EX', // Default to excluding tax for search results
        format,
      );

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
  };

  const categoryResults: SearchResult = {
    type: 'links',
    title: t('categories'),
    links:
      searchProducts.length > 0
        ? Object.entries(
            searchProducts.reduce<Record<string, string>>((categories, product) => {
              product.categories.edges?.forEach((category) => {
                categories[category.node.name] = category.node.path;
              });

              return categories;
            }, {}),
          ).map(([name, path]) => {
            return { label: name, href: path };
          })
        : [],
  };

  const brandResults: SearchResult = {
    type: 'links',
    title: t('brands'),
    links:
      searchProducts.length > 0
        ? Object.entries(
            searchProducts.reduce<Record<string, string>>((brands, product) => {
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

  const results = [];

  if (categoryResults.links.length > 0) {
    results.push(categoryResults);
  }

  if (brandResults.links.length > 0) {
    results.push(brandResults);
  }

  if (productResults.products.length > 0) {
    results.push(productResults);
  }

  return results;
}
