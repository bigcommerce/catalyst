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
  } satisfies QueryGenqlSelection;

  const queryOp = generateQueryOp(query);

  const response = await customFetch<QueryResult<typeof query>>({
    ...queryOp,
    ...config,
  });

  const { site } = response.data;

  return removeEdgesAndNodes(site.bestSellingProducts);
};
