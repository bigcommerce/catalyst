import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client-new';

import { newClient } from '..';
import { graphql } from '../generated';

type Product = NonNullable<Awaited<ReturnType<typeof getInternalProduct>>>;

export interface OptionValueId {
  optionEntityId: number;
  valueEntityId: number;
}

export interface GetProductOptions {
  productId: number;
  optionValueIds?: OptionValueId[];
}

export const GET_PRODUCT_QUERY = /* GraphQL */ `
  query getProduct($productId: Int!, $optionValueIds: [OptionValueId!]) {
    site {
      product(entityId: $productId, optionValueIds: $optionValueIds) {
        id
        entityId
        sku
        warranty
        name
        description
        plainTextDescription(characterLimit: 2000)
        availabilityV2 {
          status
          description
        }
        defaultImage {
          altText
          url(width: 600)
        }
        images {
          edges {
            node {
              altText
              url(width: 600)
              isDefault
            }
          }
        }
        prices {
          basePrice {
            currencyCode
            value
          }
          price {
            currencyCode
            value
          }
          retailPrice {
            currencyCode
            value
          }
          salePrice {
            currencyCode
            value
          }
          priceRange {
            min {
              value
              currencyCode
            }
            max {
              value
              currencyCode
            }
          }
        }
        brand {
          name
          path
        }
        upc
        path
        mpn
        gtin
        minPurchaseQuantity
        maxPurchaseQuantity
        condition
        reviewSummary {
          summationOfRatings
          numberOfReviews
          averageRating
        }
        weight {
          unit
          value
        }
        seo {
          pageTitle
          metaKeywords
          metaDescription
        }
        customFields {
          edges {
            node {
              name
              entityId
              value
            }
          }
        }
        categories(first: 1) {
          edges {
            node {
              name
              breadcrumbs(depth: 5) {
                edges {
                  node {
                    name
                  }
                }
              }
            }
          }
        }
        productOptions(first: 10) {
          edges {
            node {
              entityId
              displayName
              isRequired
              ... on MultipleChoiceOption {
                __typename
                displayStyle
                values(first: 10) {
                  edges {
                    node {
                      entityId
                      label
                      isDefault
                      __typename
                      ... on SwatchOptionValue {
                        hexColors
                        imageUrl(width: 36)
                      }
                    }
                  }
                }
              }
              ... on CheckboxOption {
                __typename
                checkedByDefault
                label
                checkedOptionValueEntityId
                uncheckedOptionValueEntityId
              }
              ... on NumberFieldOption {
                __typename
                defaultNumber: defaultValue
                highest
                isIntegerOnly
                limitNumberBy
                lowest
              }
              ... on MultiLineTextFieldOption {
                __typename
                defaultText: defaultValue
                maxLength
                minLength
                maxLines
              }
            }
          }
        }
      }
    }
  }
`;

const getInternalProduct = async (productId: number, optionValueIds?: OptionValueId[]) => {
  const query = graphql(GET_PRODUCT_QUERY);

  const response = await newClient.fetch({
    document: query,
    variables: { productId, optionValueIds },
  });

  const product = response.data.site.product;

  if (!product) {
    return null;
  }

  return product;
};

const reshapeProductCategories = (product: Product) => {
  const categories = removeEdgesAndNodes(product.categories);

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

const reshapeProductOptions = (product: Product) => {
  const productOptions = removeEdgesAndNodes(product.productOptions);

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
    categories: reshapeProductCategories(product),
    customFields: removeEdgesAndNodes(product.customFields),
    images: removeEdgesAndNodes(product.images),
    productOptions: reshapeProductOptions(product),
  };
};

export const getProduct = async (productId: number, optionValueIds?: OptionValueId[]) => {
  const product = await getInternalProduct(productId, optionValueIds);

  if (!product) {
    return null;
  }

  return reshapeProduct(product);
};
