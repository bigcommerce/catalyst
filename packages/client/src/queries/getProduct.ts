import { BigCommerceResponse, FetcherInput } from '../fetcher';
import { generateQueryOp, QueryGenqlSelection, QueryResult } from '../generated';
import { removeEdgesAndNodes } from '../utils/removeEdgesAndNodes';

type Product = NonNullable<Awaited<ReturnType<typeof internalGetProduct>>>;

export interface OptionValueId {
  optionEntityId: number;
  valueEntityId: number;
}

export interface GetProductOptions {
  productId: number;
  optionValueIds?: OptionValueId[];
}

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
                  __args: { first: 10 },
                  edges: {
                    node: {
                      entityId: true,
                      label: true,
                      isDefault: true,
                      __typename: true,
                      on_SwatchOptionValue: {
                        hexColors: true,
                        imageUrl: {
                          __args: { width: 36 },
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
        entityId: true,
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
            __args: { width: 600 },
          },
        },
        images: {
          edges: {
            node: {
              altText: true,
              url: {
                __args: { width: 600 },
              },
              isDefault: true,
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
        upc: true,
        minPurchaseQuantity: true,
        maxPurchaseQuantity: true,
        condition: true,
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
  options: GetProductOptions,
  config: T = {} as T,
) => {
  const product = await internalGetProduct(options, customFetch, config);

  if (!product) {
    return null;
  }

  return reshapeProduct(product);
};
