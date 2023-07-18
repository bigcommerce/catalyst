import { BigCommerceResponse, FetcherInput } from '../fetcher';
import { generateQueryOp, QueryGenqlSelection, QueryResult } from '../generated';
import { removeEdgesAndNodes } from '../utils/removeEdgesAndNodes';

export interface GetFeaturedProductsOptions {
  first: number;
  imageWidth: number;
  imageHeight: number;
}

export const getFeaturedProductsQuery = (
  { first = 10, imageHeight = 300, imageWidth = 300 }: Partial<GetFeaturedProductsOptions> = {},
): QueryGenqlSelection => {
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
          },
        },
      },
    },
  };
  return query;
}

export const getFeaturedProducts = async <T>(
  customFetch: <U>(data: FetcherInput) => Promise<BigCommerceResponse<U>>,
  options: Partial<GetFeaturedProductsOptions> = {},
  config: T = {} as T,
) => {
  const query = getFeaturedProductsQuery(options);

  const queryOp = generateQueryOp(query);
  const response = await customFetch<QueryResult<typeof query>>({
    ...queryOp,
    ...config,
  });
  const { site } = response.data;
  response.data.site

  return removeEdgesAndNodes(site.featuredProducts);
};
