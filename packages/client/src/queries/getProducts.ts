import { BigCommerceResponse, FetcherInput } from '../fetcher';
import { generateQueryOp, QueryGenqlSelection, QueryResult } from '../generated';
import { removeEdgesAndNodes } from '../utils/removeEdgesAndNodes';

export interface GetProductsArguments {
  productIds: number[];
  first: number;
  images: { width: number; height?: number };
}

export const getProducts = async <T>(
  customFetch: <U>(data: FetcherInput) => Promise<BigCommerceResponse<U>>,
  args: GetProductsArguments,
  config: T = {} as T,
) => {
  const { productIds, images, first } = args;

  const query = {
    site: {
      products: {
        __args: {
          entityIds: productIds,
          first,
        },
        edges: {
          node: {
            availabilityV2: {
              status: true,
            },
            brand: {
              name: true,
            },
            entityId: true,
            images: {
              edges: {
                node: {
                  url: {
                    __args: {
                      width: images.width,
                      height: images.height,
                    },
                  },
                  altText: true,
                  isDefault: true,
                },
              },
            },
            inventory: {
              aggregated: {
                availableToSell: true,
              },
            },
            name: true,
            path: true,
            description: true,
            reviewSummary: {
              summationOfRatings: true,
            },
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
            },
            productOptions: {
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

  const products = removeEdgesAndNodes(response.data.site.products);

  return products.map((product) => ({
    ...product,
    images: removeEdgesAndNodes(product.images),
  }));
};
