import { BigCommerceResponse, FetcherInput } from '../fetcher';
import { generateQueryOp, QueryResult } from '../generated';
import { removeEdgesAndNodes } from '../utils/removeEdgesAndNodes';

export const getProductReviews = async <T>(
  customFetch: <U>(data: FetcherInput) => Promise<BigCommerceResponse<U>>,
  productId: number,
  config: T = {} as T,
) => {
  const query = {
    site: {
      product: {
        __args: {
          entityId: productId,
        },
        reviewSummary: {
          summationOfRatings: true,
          numberOfReviews: true,
          averageRating: true,
        },
        reviews: {
          __args: {
            first: 5,
          },
          edges: {
            node: {
              author: {
                name: true,
              },
              entityId: true,
              title: true,
              text: true,
              rating: true,
              createdAt: {
                utc: true,
              },
            },
          },
        },
      },
    },
  };

  const queryOp = generateQueryOp(query);
  const response = await customFetch<QueryResult<typeof query>>({
    ...queryOp,
    ...config,
  });
  const { product } = response.data.site;

  if (!product) {
    return undefined;
  }

  return {
    reviewSummary: product.reviewSummary,
    reviews: removeEdgesAndNodes(product.reviews),
  };
};
