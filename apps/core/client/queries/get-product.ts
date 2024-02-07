import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { graphql } from '../generated';
import { ExistingResultType } from '../util';

type Product = ExistingResultType<typeof getInternalProduct>;

export interface OptionValueId {
  optionEntityId: number;
  valueEntityId: number;
}

export interface GetProductOptions {
  productId: number;
  optionValueIds?: OptionValueId[];
}

export const PRICES_FRAGMENT = /* GraphQL */ `
  fragment Prices on Product {
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
  }
`;

export const BASIC_PRODUCT_FRAGMENT = /* GraphQL */ `
  fragment BasicProduct on Product {
    id
    entityId
    name
    path
    brand {
      name
      path
    }
    ...Prices
  }
`;

export const PRODUCT_OPTIONS_FRAGMENT = /* GraphQL */ `
  fragment ProductOptions on Product {
    productOptions(first: 10) {
      edges {
        node {
          entityId
          displayName
          isRequired
          isVariantOption
          ... on MultipleChoiceOption {
            __typename
            displayStyle
            values(first: 10) {
              edges {
                node {
                  entityId
                  label
                  isDefault
                  isSelected
                  ... on SwatchOptionValue {
                    __typename
                    hexColors
                    imageUrl(width: 36)
                  }
                  ... on ProductPickListOptionValue {
                    __typename
                    defaultImage {
                      altText
                      url(width: 48)
                    }
                    productId
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
          ... on TextFieldOption {
            __typename
            defaultText: defaultValue
            maxLength
            minLength
          }
          ... on MultiLineTextFieldOption {
            __typename
            defaultText: defaultValue
            maxLength
            minLength
            maxLines
          }
          ... on DateFieldOption {
            __typename
            defaultDate: defaultValue
            earliest
            latest
            limitDateBy
          }
        }
      }
    }
  }
`;

export const GET_PRODUCT_QUERY = /* GraphQL */ `
  query getProduct($productId: Int!, $optionValueIds: [OptionValueId!]) {
    site {
      product(entityId: $productId, optionValueIds: $optionValueIds) {
        ...BasicProduct
        sku
        warranty
        description
        plainTextDescription(characterLimit: 2000)
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
        availabilityV2 {
          status
          description
        }
        upc
        path
        mpn
        gtin
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
        minPurchaseQuantity
        maxPurchaseQuantity
        ...ProductOptions
      }
    }
  }
`;

const getInternalProduct = async (productId: number, optionValueIds?: OptionValueId[]) => {
  const query = graphql(GET_PRODUCT_QUERY);
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: query,
    variables: { productId, optionValueIds },
    customerId,
    fetchOptions: {
      cache: customerId ? 'no-store' : 'force-cache',
    },
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

export const getProduct = cache(async (productId: number, optionValueIds?: OptionValueId[]) => {
  const product = await getInternalProduct(productId, optionValueIds);

  if (!product) {
    return null;
  }

  return reshapeProduct(product);
});
