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
            defaultImage: {
              altText: true,
              url: {
                __args: {
                  width: imageWidth,
                  height: imageHeight,
                },
              },
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
