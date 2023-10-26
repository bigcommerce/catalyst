import { BigCommerceResponse, FetcherInput } from '../fetcher';
import { generateQueryOp, QueryGenqlSelection, QueryResult } from '../generated';
import { removeEdgesAndNodes } from '../utils/removeEdgesAndNodes';

export interface GetBestSellingProductsOptions {
  first: number;
  imageWidth: number;
  imageHeight: number;
}

export const getBestSellingProducts = async <T>(
  customFetch: <U>(data: FetcherInput) => Promise<BigCommerceResponse<U>>,
  { first = 10, imageHeight = 300, imageWidth = 300 }: Partial<GetBestSellingProductsOptions> = {},
  config: T = {} as T,
) => {
  const query = {
    site: {
      bestSellingProducts: {
        __args: {
          first,
        },
        edges: {
          node: {
            name: true,
            entityId: true,
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
            brand: {
              name: true,
            },
            path: true,
            defaultImage: {
              altText: true,
              url: {
                __args: {
                  width: imageWidth,
                  height: imageHeight,
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
  } satisfies QueryGenqlSelection;

  const queryOp = generateQueryOp(query);

  const response = await customFetch<QueryResult<typeof query>>({
    ...queryOp,
    ...config,
  });

  const { site } = response.data;

  return removeEdgesAndNodes(site.bestSellingProducts).map((bestSellingProduct) => ({
    ...bestSellingProduct,
    productOptions: removeEdgesAndNodes(bestSellingProduct.productOptions),
  }));
};
