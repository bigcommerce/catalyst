import { BigCommerceResponse, FetcherInput } from '../fetcher';
import { generateQueryOp, QueryGenqlSelection, QueryResult } from '../generated';
import { removeEdgesAndNodes } from '../utils/removeEdgesAndNodes';

type Product = NonNullable<Awaited<ReturnType<typeof internalGetProduct>>>;

const reshapeProductCategories = (categoryConnection: Product['categories']) => {
  const categories = removeEdgesAndNodes(categoryConnection);

  if (!categories.length) {
    return undefined;
  }

  return categories.map((category) => {
    return {
      ...category,
      breadcrumbs: removeEdgesAndNodes(category.breadcrumbs),
    };
  });
};

const reshapeProductOptions = (productOptionConnection: Product['productOptions']) => {
  const productOptions = removeEdgesAndNodes(productOptionConnection);

  if (!productOptions.length) {
    return undefined;
  }

  return productOptions.map((option) => {
    if (option.__typename === 'MultipleChoiceOption') {
      return {
        ...option,
        values: removeEdgesAndNodes(option.values),
      };
    }

    return option;
  });
};

const reshapeProduct = (product: Product) => {
  return {
    ...product,
    categories: reshapeProductCategories(product.categories),
    images: removeEdgesAndNodes(product.images),
    productOptions: reshapeProductOptions(product.productOptions),
  };
};

async function internalGetProduct<T>(
  productId: number,
  customFetch: <U>(data: FetcherInput) => Promise<BigCommerceResponse<U>>,
  config: T = {} as T,
) {
  const query = {
    site: {
      product: {
        __args: {
          entityId: productId,
        },
        categories: {
          __args: { first: 1 },
          edges: {
            node: {
              name: true,
              breadcrumbs: {
                __args: { depth: 5 },
                edges: {
                  node: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        productOptions: {
          __args: { first: 3 },
          edges: {
            node: {
              entityId: true,
              displayName: true,
              isRequired: true,
              __typename: true,
              on_MultipleChoiceOption: {
                displayStyle: true,
                values: {
                  __args: { first: 5 },
                  edges: {
                    node: {
                      entityId: true,
                      label: true,
                      isDefault: true,
                      on_SwatchOptionValue: {
                        hexColors: true,
                        imageUrl: {
                          __args: { width: 200 },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        id: true,
        sku: true,
        warranty: true,
        name: true,
        plainTextDescription: {
          __args: { characterLimit: 2_000 },
        },
        availabilityV2: {
          status: true,
          description: true,
        },
        defaultImage: {
          altText: true,
          url: {
            __args: { width: 320 },
          },
        },
        images: {
          edges: {
            node: {
              altText: true,
              url: {
                __args: { width: 320 },
              },
            },
          },
        },
        prices: {
          price: {
            value: true,
            currencyCode: true,
          },
        },
        brand: {
          name: true,
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

export const getProduct = async <T>(
  customFetch: <U>(data: FetcherInput) => Promise<BigCommerceResponse<U>>,
  productId: number,
  config: T = {} as T,
) => {
  const product = await internalGetProduct(productId, customFetch, config);

  if (!product) {
    return null;
  }

  return reshapeProduct(product);
};
