import { notFound } from 'next/navigation';
import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { PricingFragment } from '~/client/fragments/pricing';
import { graphql, VariablesOf } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { FeaturedProductsCarouselFragment } from '~/components/featured-products-carousel/fragment';
import { getPreferredCurrencyCode } from '~/lib/currency';

import { ProductSchemaFragment } from './_components/product-schema/fragment';
import { ProductViewedFragment } from './_components/product-viewed/fragment';
import axios from 'axios';

const MultipleChoiceFieldFragment = graphql(`
  fragment MultipleChoiceFieldFragment on MultipleChoiceOption {
    entityId
    displayName
    displayStyle
    isRequired
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
            imageUrl(lossy: true, width: 40)
          }
          ... on ProductPickListOptionValue {
            __typename
            defaultImage {
              altText
              url: urlTemplate(lossy: true)
            }
          }
        }
      }
    }
  }
`);

const CheckboxFieldFragment = graphql(`
  fragment CheckboxFieldFragment on CheckboxOption {
    entityId
    isRequired
    displayName
    checkedByDefault
    label
    checkedOptionValueEntityId
    uncheckedOptionValueEntityId
  }
`);

const NumberFieldFragment = graphql(`
  fragment NumberFieldFragment on NumberFieldOption {
    entityId
    displayName
    isRequired
    defaultNumber: defaultValue
    highest
    isIntegerOnly
    limitNumberBy
    lowest
  }
`);

const TextFieldFragment = graphql(`
  fragment TextFieldFragment on TextFieldOption {
    entityId
    displayName
    isRequired
    defaultText: defaultValue
    maxLength
    minLength
  }
`);

const MultiLineTextFieldFragment = graphql(`
  fragment MultiLineTextFieldFragment on MultiLineTextFieldOption {
    entityId
    displayName
    isRequired
    defaultText: defaultValue
    maxLength
    minLength
    maxLines
  }
`);

const DateFieldFragment = graphql(`
  fragment DateFieldFragment on DateFieldOption {
    entityId
    displayName
    isRequired
    defaultDate: defaultValue
    earliest
    latest
    limitDateBy
  }
`);

const AddToCartButtonFragment = graphql(`
  fragment AddToCartButtonFragment on Product {
    inventory {
      isInStock
    }
    availabilityV2 {
      status
    }
  }
`);

export const ProductFormFragment = graphql(
  `
    fragment ProductFormFragment on Product {
      entityId
      variants {
        edges {
          node {
            entityId
          }
        }
      }
      productOptions(first: 10) {
        edges {
          node {
            __typename
            entityId
            displayName
            isRequired
            isVariantOption
            ...MultipleChoiceFieldFragment
            ...CheckboxFieldFragment
            ...NumberFieldFragment
            ...TextFieldFragment
            ...MultiLineTextFieldFragment
            ...DateFieldFragment
          }
        }
      }
      ...AddToCartButtonFragment
    }
  `,
  [
    MultipleChoiceFieldFragment,
    CheckboxFieldFragment,
    NumberFieldFragment,
    TextFieldFragment,
    MultiLineTextFieldFragment,
    DateFieldFragment,
    AddToCartButtonFragment,
  ],
);

const ProductDetailsFragment = graphql(
  `
    fragment ProductDetailsFragment on Product {
      entityId
      name
      description
      path
      images {
        edges {
          node {
            altText
            url: urlTemplate(lossy: true)
            isDefault
          }
        }
      }
      defaultImage {
        altText
        url: urlTemplate(lossy: true)
      }
      brand {
        name
      }
      reviewSummary {
        averageRating
      }
      description
      sku
      weight {
        value
        unit
      }
      condition
      customFields {
        edges {
          node {
            entityId
            name
            value
          }
        }
      }
      warranty
      ...PricingFragment
      ...ProductFormFragment
    }
  `,
  [PricingFragment, ProductFormFragment],
);

const ProductPageQuery = graphql(
  `
    query ProductPageQuery(
      $entityId: Int!
      $optionValueIds: [OptionValueId!]
      $useDefaultOptionSelections: Boolean
      $currencyCode: currencyCode
    ) {
      site {
        product(
          entityId: $entityId
          optionValueIds: $optionValueIds
          useDefaultOptionSelections: $useDefaultOptionSelections
        ) {
          ...ProductDetailsFragment
          ...ProductViewedFragment
          ...ProductSchemaFragment
          name
          defaultImage {
            url: urlTemplate(lossy: true)
            altText
          }
          seo {
            pageTitle
            metaDescription
            metaKeywords
          }
          categories {
            edges {
              node {
                products(first: 8) {
                  edges {
                    node {
                      ...FeaturedProductsCarouselFragment
                    }
                  }
                }
              }
            }
          }
          relatedProducts(first: 8) {
            edges {
              node {
                ...FeaturedProductsCarouselFragment
              }
            }
          }
        }
      }
    }
  `,
  [
    ProductDetailsFragment,
    ProductViewedFragment,
    ProductSchemaFragment,
    FeaturedProductsCarouselFragment,
  ],
);

type Variables = VariablesOf<typeof ProductPageQuery>;

export const getProductData = cache(async (variables: Variables) => {
  const customerAccessToken = await getSessionCustomerAccessToken();
  const currencyCode = await getPreferredCurrencyCode();

  const { data } = await client.fetch({
    document: ProductPageQuery,
    variables: { ...variables, currencyCode },
    customerAccessToken,
    fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
  });

  const product = data.site.product;

  if (!product) {
    return notFound();
  }

  const productRest = await getProductDataRest(product.sku);

  return {
    ...product,
    inventory_tracking: productRest ? (productRest.inventory_tracking as string) : null,
    inventory_level: productRest ? (productRest.inventory_level as number) : null,
  };
});

export const getProductDataRest = async (sku: string) => {
  try {
    const response = await axios.get(
      `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v3/catalog/products?sku=${encodeURIComponent(sku)}`,
      {
        headers: {
          'X-Auth-Token': process.env.BIGCOMMERCE_API_ACCESS_TOKEN,
        },
      },
    );

    const product = response.data.data[0];

    if (!product) {
      return null;
    }

    return product;
  } catch (error) {
    console.error('Error fetching product data from BigCommerce API:', error);
    return null;
  }
};
