import { cache } from 'react';
import { algoliasearch } from 'algoliasearch';
import { createFetchRequester } from '@algolia/requester-fetch';
import { ResultOf } from 'gql.tada';

import { getSessionCustomerId } from '~/auth';
import { PricingFragment, ProductCardFragment } from '~/components/product-card';

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '',
  process.env.NEXT_PUBLIC_ALGOLIA_APP_KEY || '',
  { requester: createFetchRequester() },
);

interface QuickSearch {
  searchTerm: string;
}

interface ProductSearchResponse {
  hits: Product[];
  nbHits: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
  exhaustiveNbHits: boolean;
  exhaustiveTypo: boolean;
  exhaustive: {
    nbHits: boolean;
    typo: boolean;
  };
  query: string;
  params: string;
  renderingContent: Record<string, unknown>;
  processingTimeMS: number;
  processingTimingsMS: {
    _request: {
      roundTrip: number;
    };
    afterFetch: {
      format: {
        total: number;
      };
    };
    getIdx: {
      load: {
        total: number;
      };
      total: number;
    };
    total: number;
  };
  serverTimeMS: number;
}

interface Product {
  name: string;
  brand_id: number;
  brand_name: string;
  sku: string;
  url: string;
  image_url: string;
  product_images: ProductImage[];
  description: string;
  is_visible: boolean;
  in_stock: boolean;
  inventory_tracking: string;
  inventory: number;
  date_created: string;
  date_modified: string;
  categories_without_path: string[];
  categories: {
    lvl0: string[];
  };
  category_ids: number[];
  variant_ids: number[];
  variants: Variant[];
  option_names: string[];
  _tags: string[];
  default_price: number;
  prices: Record<string, number>;
  sales_prices: Record<string, number>;
  retail_prices: Record<string, number>;
  custom_fields: Record<string, unknown>;
  metafields: unknown;
  objectID: string;
  _highlightResult: HighlightResult;
}

interface ProductImage {
  description: string;
  is_thumbnail: boolean;
  url_thumbnail: string;
}

interface Variant {
  id: number;
  image_url: string;
  sku: string;
  inventory: number;
  in_stock: boolean;
  prices: Record<string, number>;
  sales_prices: Record<string, number>;
  retail_prices: Record<string, number>;
  options: Record<string, string>;
  metafields: unknown;
}

interface HighlightResult {
  name: HighlightResultItem;
  brand_id: HighlightResultItem;
  brand_name: HighlightResultItem;
  sku: HighlightResultItem;
  url: HighlightResultItem;
  image_url: HighlightResultItem;
  product_images: HighlightResultImage[];
  description: HighlightResultItem;
  inventory_tracking: HighlightResultItem;
  inventory: HighlightResultItem;
  date_created: HighlightResultItem;
  date_modified: HighlightResultItem;
  categories_without_path: HighlightResultItem[];
  categories: {
    lvl0: HighlightResultItem[];
  };
  category_ids: HighlightResultItem[];
  variant_ids: HighlightResultItem[];
  variants: HighlightResultVariant[];
  option_names: HighlightResultItem[];
  _tags: HighlightResultItem[];
  default_price: HighlightResultItem;
  prices: Record<string, HighlightResultItem>;
  sales_prices: Record<string, HighlightResultItem>;
  retail_prices: Record<string, HighlightResultItem>;
}

interface HighlightResultItem {
  value: string;
  matchLevel: string;
  fullyHighlighted?: boolean;
  matchedWords: string[];
}

interface HighlightResultImage {
  description: HighlightResultItem;
  url_thumbnail: HighlightResultItem;
}

interface HighlightResultVariant {
  id: HighlightResultItem;
  image_url: HighlightResultItem;
  sku: HighlightResultItem;
  inventory: HighlightResultItem;
  prices: Record<string, HighlightResultItem>;
  sales_prices: Record<string, HighlightResultItem>;
  retail_prices: Record<string, HighlightResultItem>;
  options?: {
    [key: string]: HighlightResultItem;
  };
}

interface QuickSearchProduct {
  entityId: string;
  name: string;
  path: string;
  defaultImage: ResultOf<typeof ProductCardFragment>['defaultImage'];
  categories: {
    edges: {
      node: {
        name: string;
        path: string;
      };
    }[];
  };
  brand: ResultOf<typeof ProductCardFragment>['brand'];
  reviewSummary: null;
  prices: ResultOf<typeof PricingFragment>['prices'];
}

export const getQuickSearchResults = cache(async ({ searchTerm }: QuickSearch) => {
  const selectedCurrency = 'USD'; // TODO: use selected storefront currency
  const customerId = await getSessionCustomerId(); // Customer specific product viz / pricing not implmented in Algolia's app integration yet

  try {
    const { results } = await searchClient.search<ProductSearchResponse>([
      {
        indexName: process.env.NEXT_PUBLIC_ALGOLIA_INDEXNAME,
        query: searchTerm,
        params: {
          hitsPerPage: 5,
        },
      },
    ]);

    const products: QuickSearchProduct[] = results[0].hits.map((hit: Product) => ({
      entityId: hit.objectID,
      name: hit.name,
      path: hit.url,
      defaultImage: {
        altText: hit.product_images.filter((img) => img.is_thumbnail)[0]?.description,
        url: hit.product_images.filter((img) => img.is_thumbnail)[0]?.url_thumbnail,
      },
      categories: {
        edges: hit.categories.lvl0.map((categoryName) => ({
          node: {
            name: categoryName,
            path: `/${categoryName.replaceAll(' ', '-').toLowerCase()}`, // Not implmented in Algolia's app integration yet
          },
        })),
      },
      brand: {
        name: hit.brand_name,
        path: `/${hit.brand_name.replaceAll(' ', '-').toLowerCase()}`, // Not implmented in Algolia's app integration yet
      },
      reviewSummary: null, // Not implmented in Algolia's app integration yet
      prices: {
        price: {
          value: hit.prices?.[selectedCurrency],
          currencyCode: selectedCurrency,
        },
        /* Base price not implemented in Algolia's app integration yet */
        // basePrice: {
        //   value: hit.base_prices?.[selectedCurrency],
        //   currencyCode: selectedCurrency
        // },
        retailPrice: {
          value: hit.retail_prices?.[selectedCurrency],
          currencyCode: selectedCurrency,
        },
        salePrice: {
          value: hit.sales_prices?.[selectedCurrency],
          currencyCode: selectedCurrency,
        },
        /* Price range not implemented in Algolia's app integration yet */
        priceRange: {
          min: {
            value: hit.retail_prices?.[selectedCurrency],
            currencyCode: selectedCurrency,
          },
          max: {
            value: hit.retail_prices?.[selectedCurrency],
            currencyCode: selectedCurrency,
          },
        },
      },
    }));

    return { products };
  } catch (error) {
    console.error('Error during Algolia search:', error);
    return { products: [] };
  }
});
