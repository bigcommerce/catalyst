import { ResultOf } from 'gql.tada';
import { getFormatter, getTranslations } from 'next-intl/server';

import { SearchResult } from '@/vibes/soul/primitives/navigation';
import { SearchProductFragment } from '~/components/header/_actions/fragment';

import { pricesTransformer } from './prices-transformer';

export interface AlgoliaHit {
  objectID: string;
  name: string;
  url: string;
  product_images: Array<{ description: string; is_thumbnail: boolean; url_thumbnail: string }>;
  categories_without_path: string[];
  default_price: string;
  prices: Record<string, number>;
  sales_prices: Record<string, number>;
  calculated_prices: Record<string, number>;
  retail_prices: Record<string, number>;
}

export async function algoliaResultsTransformer(hits: AlgoliaHit[]): Promise<SearchResult[]> {
  const format = await getFormatter();
  const t = await getTranslations('Components.Header.Search');

  const products = hits.map((hit) => {
    const price = pricesTransformer(
      {
        price: {
          value: hit.calculated_prices.USD ?? 0,
          currencyCode: 'USD',
        },
        basePrice: {
          value: parseInt(hit.default_price, 10),
          currencyCode: 'USD',
        },
        retailPrice: {
          value: hit.retail_prices.USD ?? 0,
          currencyCode: 'USD',
        },
        salePrice: {
          value:
            hit.sales_prices.USD && hit.sales_prices.USD > 0
              ? hit.sales_prices.USD
              : parseInt(hit.default_price, 10),
          currencyCode: 'USD',
        },
        priceRange: {
          min: {
            value: hit.prices.USD ?? 0,
            currencyCode: 'USD',
          },
          max: {
            value: hit.prices.USD ?? 0,
            currencyCode: 'USD',
          },
        },
      },
      format,
    );

    return {
      id: hit.objectID,
      title: hit.name,
      href: hit.url,
      price,
      image: {
        src: hit.product_images.find((image) => image.is_thumbnail)?.url_thumbnail ?? '',
        alt: hit.product_images[0]?.description ?? '',
      },
    };
  });

  const productResults: SearchResult = {
    type: 'products',
    title: t('products'),
    products,
  };

  const uniqueCategories = Array.from(
    new Set(hits.flatMap((product) => product.categories_without_path)),
  );

  const categoryResults: SearchResult = {
    type: 'links',
    title: t('categories'),
    links: uniqueCategories.map((category) => {
      return { label: category, href: `/${category.toLowerCase().replace(/\s+/g, '-')}` };
    }),
  };

  const results = [];

  if (categoryResults.links.length > 0) {
    results.push(categoryResults);
  }

  if (products.length > 0) {
    results.push(productResults);
  }

  return results;
}

export async function searchResultsTransformer(
  searchProducts: Array<ResultOf<typeof SearchProductFragment>>,
): Promise<SearchResult[]> {
  const format = await getFormatter();
  const t = await getTranslations('Components.Header.Search');

  const productResults: SearchResult = {
    type: 'products',
    title: t('products'),
    products: searchProducts.map((product) => {
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
