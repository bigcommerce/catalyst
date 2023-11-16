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
    customFields: removeEdgesAndNodes(product.customFields),
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
          __args: { first: 10 },
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
              on_CheckboxOption: {
                checkedByDefault: true,
                label: true,
                checkedOptionValueEntityId: true,
                uncheckedOptionValueEntityId: true,
              },
              on_NumberFieldOption: {
                defaultValue: true,
                highest: true,
                isIntegerOnly: true,
                limitNumberBy: true,
                lowest: true,
              },
            },
          },
        },
        id: true,
        entityId: true,
        sku: true,
        warranty: true,
        name: true,
        description: true,
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
          path: true,
        },
        upc: true,
        path: true,
        mpn: true,
        gtin: true,
        minPurchaseQuantity: true,
        maxPurchaseQuantity: true,
        condition: true,
        reviewSummary: {
          summationOfRatings: true,
          numberOfReviews: true,
          averageRating: true,
        },
        weight: {
          unit: true,
          value: true,
        },
        seo: {
          pageTitle: true,
          metaKeywords: true,
          metaDescription: true,
        },
        customFields: {
          edges: {
            node: {
              name: true,
              entityId: true,
              value: true,
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
