import { unstable_cache } from 'next/cache';
import { getLocale } from 'next-intl/server';
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

const getCachedProductPageMetadata = unstable_cache(
  async (_locale: string, entityId: number) => {
    const { data } = await client.fetch({
      document: ProductPageMetadataQuery,
      variables: { entityId },
      fetchOptions: { cache: 'no-store' },
    });

    return data.site.product;
  },
  ['get-product-page-metadata'],
  { revalidate },
);

export const getProductPageMetadata = cache(
  async (entityId: number, customerAccessToken?: string) => {
    if (customerAccessToken) {
      const { data } = await client.fetch({
        document: ProductPageMetadataQuery,
        variables: { entityId },
        customerAccessToken,
        fetchOptions: { cache: 'no-store' },
      });

      return data.site.product;
    }

    const locale = await getLocale();

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

const getCachedProduct = unstable_cache(
  async (_locale: string, entityId: number) => {
    const { data } = await client.fetch({
      document: ProductQuery,
      variables: { entityId },
      fetchOptions: { cache: 'no-store' },
    });

    return data.site;
  },
  ['get-product'],
  { revalidate },
);

export const getProduct = cache(async (entityId: number, customerAccessToken?: string) => {
  if (customerAccessToken) {
    const { data } = await client.fetch({
      document: ProductQuery,
      variables: { entityId },
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });

    return data.site;
  }

  const locale = await getLocale();

  return getCachedProduct(locale, entityId);
});

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

const getCachedStreamableProductVariantInventory = unstable_cache(
  async (_locale: string, variables: VariantInventoryVariables) => {
    const { data } = await client.fetch({
      document: StreamableProductVariantInventoryBySkuQuery,
      variables,
      fetchOptions: { cache: 'no-store' },
    });

    return data.site.product?.variants;
  },
  ['get-streamable-product-variant-inventory'],
  { revalidate: 60 },
);

export const getStreamableProductVariantInventory = cache(
  async (variables: VariantInventoryVariables, customerAccessToken?: string) => {
    if (customerAccessToken) {
      const { data } = await client.fetch({
        document: StreamableProductVariantInventoryBySkuQuery,
        variables,
        customerAccessToken,
        fetchOptions: { cache: 'no-store' },
      });

      return data.site.product?.variants;
    }

    const locale = await getLocale();

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

const getCachedStreamableProduct = unstable_cache(
  async (_locale: string, variables: Variables) => {
    const { data } = await client.fetch({
      document: StreamableProductQuery,
      variables,
      fetchOptions: { cache: 'no-store' },
    });

    return data.site.product;
  },
  ['get-streamable-product'],
  { revalidate },
);

export const getStreamableProduct = cache(
  async (variables: Variables, customerAccessToken?: string) => {
    if (customerAccessToken) {
      const { data } = await client.fetch({
        document: StreamableProductQuery,
        variables,
        customerAccessToken,
        fetchOptions: { cache: 'no-store' },
      });

      return data.site.product;
    }

    const locale = await getLocale();

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

const getCachedStreamableProductInventory = unstable_cache(
  async (_locale: string, variables: ProductInventoryVariables) => {
    const { data } = await client.fetch({
      document: StreamableProductInventoryQuery,
      variables,
      fetchOptions: { cache: 'no-store' },
    });

    return data.site.product;
  },
  ['get-streamable-product-inventory'],
  { revalidate: 60 },
);

export const getStreamableProductInventory = cache(
  async (variables: ProductInventoryVariables, customerAccessToken?: string) => {
    if (customerAccessToken) {
      const { data } = await client.fetch({
        document: StreamableProductInventoryQuery,
        variables,
        customerAccessToken,
        fetchOptions: { cache: 'no-store' },
      });

      return data.site.product;
    }

    const locale = await getLocale();

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

const getCachedProductPricingAndRelatedProducts = unstable_cache(
  async (_locale: string, variables: Variables) => {
    const { data } = await client.fetch({
      document: ProductPricingAndRelatedProductsQuery,
      variables,
      fetchOptions: { cache: 'no-store' },
    });

    return data.site.product;
  },
  ['get-product-pricing-and-related-products'],
  { revalidate },
);

export const getProductPricingAndRelatedProducts = cache(
  async (variables: Variables, customerAccessToken?: string) => {
    if (customerAccessToken) {
      const { data } = await client.fetch({
        document: ProductPricingAndRelatedProductsQuery,
        variables,
        customerAccessToken,
        fetchOptions: { cache: 'no-store' },
      });

      return data.site.product;
    }

    const locale = await getLocale();

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

const getCachedStreamableInventorySettingsQuery = unstable_cache(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async (_locale: string) => {
    const { data } = await client.fetch({
      document: InventorySettingsQuery,
      fetchOptions: { cache: 'no-store' },
    });

    return data.site.settings?.inventory;
  },
  ['get-streamable-inventory-settings'],
  { revalidate },
);

export const getStreamableInventorySettingsQuery = cache(async (customerAccessToken?: string) => {
  if (customerAccessToken) {
    const { data } = await client.fetch({
      document: InventorySettingsQuery,
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
    });

    return data.site.settings?.inventory;
  }

  const locale = await getLocale();

  return getCachedStreamableInventorySettingsQuery(locale);
});
