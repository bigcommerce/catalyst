import { BigCommerceResponse, FetcherInput } from '../fetcher';
import { generateQueryOp, QueryGenqlSelection, QueryResult } from '../generated';
import { removeEdgesAndNodes } from '../utils/removeEdgesAndNodes';

export interface GetFeaturedProductsOptions {
  first: number;
  imageWidth: number;
  imageHeight: number;
}

export const getFeaturedProducts = async <T>(
  customFetch: <U>(data: FetcherInput) => Promise<BigCommerceResponse<U>>,
  { first = 10, imageHeight = 300, imageWidth = 300 }: Partial<GetFeaturedProductsOptions> = {},
  config: T = {} as T,
) => {
  const query = {
    site: {
      featuredProducts: {
        __args: {
          first,
        },
        edges: {
          node: {
            name: true,
            entityId: true,
            path: true,
            prices: {
              price: {
                __scalar: true,
              },
            },
            brand: {
              name: true,
            },
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

  return removeEdgesAndNodes(site.featuredProducts).map((featuredProduct) => ({
    ...featuredProduct,
    productOptions: removeEdgesAndNodes(featuredProduct.productOptions),
  }));
};
