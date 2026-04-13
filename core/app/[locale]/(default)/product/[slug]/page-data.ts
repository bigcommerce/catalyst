import { cacheLife } from 'next/cache';
import { cache } from 'react';

import { client } from '~/client';
import { PricingFragment } from '~/client/fragments/pricing';
import { graphql, VariablesOf } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { FeaturedProductsCarouselFragment } from '~/components/featured-products-carousel/fragment';
import { ProductVariantsInventoryFragment } from '~/components/product-variants-inventory/fragment';

import { ProductSchemaFragment } from './_components/product-schema/fragment';
import { ProductViewedFragment } from './_components/product-viewed/fragment';

const MultipleChoiceFieldFragment = graphql(`
  fragment MultipleChoiceFieldFragment on MultipleChoiceOption {
    entityId
    displayName
    displayStyle
    isRequired
    values(first: 50) {
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

export const ProductOptionsFragment = graphql(
  `
    fragment ProductOptionsFragment on Product {
      entityId
      productOptions(first: 50) {
        edges {
          node {
            __typename
            entityId
            displayName
            isRequired
            ...MultipleChoiceFieldFragment
            ...CheckboxFieldFragment
            ...NumberFieldFragment
            ...TextFieldFragment
            ...MultiLineTextFieldFragment
            ...DateFieldFragment
          }
        }
      }
    }
  `,
  [
    MultipleChoiceFieldFragment,
    CheckboxFieldFragment,
    NumberFieldFragment,
    TextFieldFragment,
    MultiLineTextFieldFragment,
    DateFieldFragment,
  ],
);

const ProductPageMetadataQuery = graphql(`
  query ProductPageMetadataQuery($entityId: Int!) {
    site {
      product(entityId: $entityId) {
        name
        path
        defaultImage {
          altText
          url: urlTemplate(lossy: true)
        }
        seo {
          pageTitle
          metaDescription
          metaKeywords
        }
        plainTextDescription(characterLimit: 1200)
      }
    }
  }
`);

async function getCachedProductPageMetadata(locale: string, entityId: number) {
  'use cache';

  cacheLife({ revalidate });

  const { data } = await client.fetch({
    document: ProductPageMetadataQuery,
    variables: { entityId },
    locale,
    fetchOptions: { cache: 'no-store' },
  });

  return data.site.product;
}

export const getProductPageMetadata = cache(
  async (locale: string, entityId: number, customerAccessToken?: string) => {
    if (customerAccessToken) {
      const { data } = await client.fetch({
        document: ProductPageMetadataQuery,
        variables: { entityId },
        customerAccessToken,
        locale,
        fetchOptions: { cache: 'no-store' },
      });

      return data.site.product;
    }

    return getCachedProductPageMetadata(locale, entityId);
  },
);

const ProductQuery = graphql(
  `
    query ProductQuery($entityId: Int!) {
      site {
        settings {
          reviews {
            enabled
          }
          display {
            showProductRating
          }
        }
        product(entityId: $entityId) {
          entityId
          name
          description
          path
          brand {
            name
          }
          reviewSummary {
            averageRating
            numberOfReviews
          }
          description
          ...ProductOptionsFragment
        }
      }
    }
  `,
  [ProductOptionsFragment],
);

async function getCachedProduct(locale: string, entityId: number) {
  'use cache';

  cacheLife({ revalidate });

  const { data } = await client.fetch({
    document: ProductQuery,
    variables: { entityId },
    locale,
    fetchOptions: { cache: 'no-store' },
  });

  return data.site;
}

export const getProduct = cache(
  async (locale: string, entityId: number, customerAccessToken?: string) => {
    if (customerAccessToken) {
      const { data } = await client.fetch({
        document: ProductQuery,
        variables: { entityId },
        customerAccessToken,
        locale,
        fetchOptions: { cache: 'no-store' },
      });

      return data.site;
    }

    return getCachedProduct(locale, entityId);
  },
);

const StreamableProductVariantInventoryBySkuQuery = graphql(`
  query ProductVariantBySkuQuery($productId: Int!, $sku: String!) {
    site {
      product(entityId: $productId) {
        variants(skus: [$sku]) {
          edges {
            node {
              id
              entityId
              sku
              inventory {
                aggregated {
                  availableToSell
                  warningLevel
                  availableOnHand
                  availableForBackorder
                  unlimitedBackorder
                }
                byLocation {
                  edges {
                    node {
                      locationEntityId
                      backorderMessage
                    }
                  }
                }
                isInStock
              }
            }
          }
        }
      }
    }
  }
`);

type VariantInventoryVariables = VariablesOf<typeof StreamableProductVariantInventoryBySkuQuery>;

async function getCachedStreamableProductVariantInventory(
  locale: string,
  variables: VariantInventoryVariables,
) {
  'use cache';

  cacheLife({ revalidate: 60 });

  const { data } = await client.fetch({
    document: StreamableProductVariantInventoryBySkuQuery,
    variables,
    locale,
    fetchOptions: { cache: 'no-store' },
  });

  return data.site.product?.variants;
}

export const getStreamableProductVariantInventory = cache(
  async (locale: string, variables: VariantInventoryVariables, customerAccessToken?: string) => {
    if (customerAccessToken) {
      const { data } = await client.fetch({
        document: StreamableProductVariantInventoryBySkuQuery,
        variables,
        customerAccessToken,
        locale,
        fetchOptions: { cache: 'no-store' },
      });

      return data.site.product?.variants;
    }

    return getCachedStreamableProductVariantInventory(locale, variables);
  },
);

const StreamableProductQuery = graphql(
  `
    query StreamableProductQuery(
      $entityId: Int!
      $optionValueIds: [OptionValueId!]
      $useDefaultOptionSelections: Boolean
    ) {
      site {
        product(
          entityId: $entityId
          optionValueIds: $optionValueIds
          useDefaultOptionSelections: $useDefaultOptionSelections
        ) {
          entityId
          images(first: 12) {
            pageInfo {
              hasNextPage
              endCursor
            }
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
          minPurchaseQuantity
          maxPurchaseQuantity
          warranty
          ...ProductViewedFragment
          ...ProductSchemaFragment
        }
      }
    }
  `,
  [ProductViewedFragment, ProductSchemaFragment],
);

type Variables = VariablesOf<typeof StreamableProductQuery>;

async function getCachedStreamableProduct(locale: string, variables: Variables) {
  'use cache';

  cacheLife({ revalidate });

  const { data } = await client.fetch({
    document: StreamableProductQuery,
    variables,
    locale,
    fetchOptions: { cache: 'no-store' },
  });

  return data.site.product;
}

export const getStreamableProduct = cache(
  async (locale: string, variables: Variables, customerAccessToken?: string) => {
    if (customerAccessToken) {
      const { data } = await client.fetch({
        document: StreamableProductQuery,
        variables,
        customerAccessToken,
        locale,
        fetchOptions: { cache: 'no-store' },
      });

      return data.site.product;
    }

    return getCachedStreamableProduct(locale, variables);
  },
);

const StreamableProductInventoryQuery = graphql(
  `
    query StreamableProductInventoryQuery($entityId: Int!) {
      site {
        product(entityId: $entityId) {
          sku
          inventory {
            hasVariantInventory
            isInStock
            aggregated {
              availableToSell
              warningLevel
              availableOnHand
              availableForBackorder
              unlimitedBackorder
            }
          }
          availabilityV2 {
            status
          }
          ...ProductVariantsInventoryFragment
        }
      }
    }
  `,
  [ProductVariantsInventoryFragment],
);

type ProductInventoryVariables = VariablesOf<typeof StreamableProductQuery>;

async function getCachedStreamableProductInventory(
  locale: string,
  variables: ProductInventoryVariables,
) {
  'use cache';

  cacheLife({ revalidate: 60 });

  const { data } = await client.fetch({
    document: StreamableProductInventoryQuery,
    variables,
    locale,
    fetchOptions: { cache: 'no-store' },
  });

  return data.site.product;
}

export const getStreamableProductInventory = cache(
  async (locale: string, variables: ProductInventoryVariables, customerAccessToken?: string) => {
    if (customerAccessToken) {
      const { data } = await client.fetch({
        document: StreamableProductInventoryQuery,
        variables,
        customerAccessToken,
        locale,
        fetchOptions: { cache: 'no-store' },
      });

      return data.site.product;
    }

    return getCachedStreamableProductInventory(locale, variables);
  },
);

// Fields that require currencyCode as a query variable
// Separated from the rest to cache separately
const ProductPricingAndRelatedProductsQuery = graphql(
  `
    query ProductPricingAndRelatedProductsQuery(
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
          ...PricingFragment
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
  [PricingFragment, FeaturedProductsCarouselFragment],
);

async function getCachedProductPricingAndRelatedProducts(locale: string, variables: Variables) {
  'use cache';

  cacheLife({ revalidate });

  const { data } = await client.fetch({
    document: ProductPricingAndRelatedProductsQuery,
    variables,
    locale,
    fetchOptions: { cache: 'no-store' },
  });

  return data.site.product;
}

export const getProductPricingAndRelatedProducts = cache(
  async (locale: string, variables: Variables, customerAccessToken?: string) => {
    if (customerAccessToken) {
      const { data } = await client.fetch({
        document: ProductPricingAndRelatedProductsQuery,
        variables,
        customerAccessToken,
        locale,
        fetchOptions: { cache: 'no-store' },
      });

      return data.site.product;
    }

    return getCachedProductPricingAndRelatedProducts(locale, variables);
  },
);

const InventorySettingsQuery = graphql(`
  query InventorySettingsQuery {
    site {
      settings {
        inventory {
          defaultOutOfStockMessage
          showOutOfStockMessage
          stockLevelDisplay
          showBackorderAvailabilityPrompt
          backorderAvailabilityPrompt
          showQuantityOnBackorder
          showBackorderMessage
        }
      }
    }
  }
`);

async function getCachedStreamableInventorySettingsQuery(locale: string) {
  'use cache';

  cacheLife({ revalidate });

  const { data } = await client.fetch({
    document: InventorySettingsQuery,
    locale,
    fetchOptions: { cache: 'no-store' },
  });

  return data.site.settings?.inventory;
}

export const getStreamableInventorySettingsQuery = cache(
  async (locale: string, customerAccessToken?: string) => {
    if (customerAccessToken) {
      const { data } = await client.fetch({
        document: InventorySettingsQuery,
        customerAccessToken,
        locale,
        fetchOptions: { cache: 'no-store' },
      });

      return data.site.settings?.inventory;
    }

    return getCachedStreamableInventorySettingsQuery(locale);
  },
);
