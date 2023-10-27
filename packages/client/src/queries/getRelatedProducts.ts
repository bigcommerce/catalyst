import { BigCommerceResponse, FetcherInput } from '../fetcher';
import { generateQueryOp, QueryGenqlSelection, QueryResult } from '../generated';
import { removeEdgesAndNodes } from '../utils/removeEdgesAndNodes';

import { GetProductOptions } from './getProduct';

async function internalGetProduct<T>(
  options: GetProductOptions,
  customFetch: <U>(data: FetcherInput) => Promise<BigCommerceResponse<U>>,
  config: T = {} as T,
) {
  const { productId, optionValueIds } = options;

  const query = {
    site: {
      product: {
        __args: {
          entityId: productId,
          optionValueIds,
        },
        relatedProducts: {
          __args: { first: 12 },
          edges: {
            node: {
              entityId: true,
              name: true,
              defaultImage: {
                altText: true,
                url: {
                  __args: { width: 320 },
                },
              },
              brand: {
                name: true,
              },
              path: true,
              prices: {
                basePrice: {
                  currencyCode: true,
                  value: true,
                },
                price: {
                  currencyCode: true,
                  value: true,
                },
                retailPrice: {
                  currencyCode: true,
                  value: true,
                },
                salePrice: {
                  currencyCode: true,
                  value: true,
                },
                priceRange: {
                  min: {
                    value: true,
                    currencyCode: true,
                  },
                  max: {
                    value: true,
                    currencyCode: true,
                  },
                },
              },
              reviewSummary: {
                summationOfRatings: true,
                numberOfReviews: true,
                averageRating: true,
              },
              productOptions: {
                __args: { first: 3 },
                edges: {
                  node: {
                    entityId: true,
                  },
                },
              },
            },
          },
        },
      },
    },
  } satisfies QueryGenqlSelection;

  const queryOp = generateQueryOp(query);

  const response = await customFetch<QueryResult<typeof query>>({
    ...queryOp,
    ...config,
  });

  return response.data.site.product;
}

export const getRelatedProducts = async <T>(
  customFetch: <U>(data: FetcherInput) => Promise<BigCommerceResponse<U>>,
  options: GetProductOptions,
  config: T = {} as T,
) => {
  const product = await internalGetProduct(options, customFetch, config);

  if (!product) {
    return [];
  }

  return removeEdgesAndNodes(product.relatedProducts).map((relatedProduct) => ({
    ...relatedProduct,
    productOptions: removeEdgesAndNodes(relatedProduct.productOptions),
  }));
};
