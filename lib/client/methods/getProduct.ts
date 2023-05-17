import { client } from '../client';
import { removeEdgesAndNodes } from '../utils/removeEdgesAndNodes';

type Product = Awaited<ReturnType<typeof internalGetProduct>>;

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

async function internalGetProduct(productId: number) {
  const response = await client.query({
    site: {
      product: {
        __args: {
          entityId: productId,
        },
        categories: {
          __args: { first: 1 },
          edges: {
            node: {
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
          __args: { characterLimit: 500 },
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
  });

  return response.site.product;
}

export const getProduct = async (productId: number) => {
  const product = await internalGetProduct(productId);

  // TODO: Genql types are wrong here? Figure this out
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!product) {
    return null;
  }

  return reshapeProduct(product);
};
