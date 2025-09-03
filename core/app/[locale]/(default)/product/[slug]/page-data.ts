import { cache } from 'react';

import { client } from '~/client';
import { PricingFragment } from '~/client/fragments/pricing';
import { graphql, VariablesOf } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { FeaturedProductsCarouselFragment } from '~/components/featured-products-carousel/fragment';
import { withGraphQLSpan, addSpanAttributes } from '~/lib/otel';

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

export const getProductPageMetadata = cache(
  async (entityId: number, customerAccessToken?: string) => {
    return await withGraphQLSpan('getProductPageMetadata', async () => {
      addSpanAttributes({
        'product.entity_id': entityId,
        'product.metadata_type': 'page_metadata',
        'user.authenticated': !!customerAccessToken,
      });

      const { data } = await client.fetch({
        document: ProductPageMetadataQuery,
        variables: { entityId },
        customerAccessToken,
        fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
      });

      const product = data.site.product;
      
      if (product) {
        addSpanAttributes({
          'product.name': product.name,
          'product.has_seo': !!product.seo,
          'product.has_image': !!product.defaultImage,
        });
      }

      return product;
    });
  },
);

const ProductQuery = graphql(
  `
    query ProductQuery($entityId: Int!) {
      site {
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
          }
          description
          ...ProductOptionsFragment
        }
      }
    }
  `,
  [ProductOptionsFragment],
);

export const getProduct = cache(async (entityId: number, customerAccessToken?: string) => {
  return await withGraphQLSpan('getProduct', async () => {
    addSpanAttributes({
      'product.entity_id': entityId,
      'product.query_type': 'base_product',
      'user.authenticated': !!customerAccessToken,
    });

    const { data } = await client.fetch({
      document: ProductQuery,
      variables: { entityId },
      customerAccessToken,
      fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
    });

    const product = data.site.product;
    
    if (product) {
      addSpanAttributes({
        'product.name': product.name,
        'product.has_brand': !!product.brand,
        'product.has_reviews': !!product.reviewSummary,
        'product.options_count': product.productOptions?.edges?.length || 0,
      });
    }

    return product;
  });
});

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
          inventory {
            isInStock
          }
          availabilityV2 {
            status
          }
          ...ProductViewedFragment
          ...ProductSchemaFragment
        }
      }
    }
  `,
  [ProductViewedFragment, ProductSchemaFragment],
);

type Variables = VariablesOf<typeof StreamableProductQuery>;

export const getStreamableProduct = cache(
  async (variables: Variables, customerAccessToken?: string) => {
    return await withGraphQLSpan('getStreamableProduct', async () => {
      addSpanAttributes({
        'product.entity_id': variables.entityId,
        'product.query_type': 'streamable_product',
        'product.has_options': (variables.optionValueIds?.length || 0) > 0,
        'product.use_default_selections': variables.useDefaultOptionSelections || false,
        'user.authenticated': !!customerAccessToken,
      });

      const { data } = await client.fetch({
        document: StreamableProductQuery,
        variables,
        customerAccessToken,
        fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
      });

      const product = data.site.product;
      
      if (product) {
        addSpanAttributes({
          'product.sku': product.sku || 'unknown',
          'product.images_count': product.images?.edges?.length || 0,
          'product.custom_fields_count': product.customFields?.edges?.length || 0,
          'product.inventory_status': product.inventory?.isInStock ? 'in_stock' : 'out_of_stock',
          'product.availability_status': product.availabilityV2?.status || 'unknown',
        });
      }

      return product;
    });
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

export const getProductPricingAndRelatedProducts = cache(
  async (variables: Variables, customerAccessToken?: string) => {
    return await withGraphQLSpan('getProductPricingAndRelatedProducts', async () => {
      addSpanAttributes({
        'product.entity_id': variables.entityId,
        'product.query_type': 'pricing_and_related',
        'product.has_options': (variables.optionValueIds?.length || 0) > 0,
        'product.use_default_selections': variables.useDefaultOptionSelections || false,
        'product.currency_code': (variables as any).currencyCode || 'default',
        'user.authenticated': !!customerAccessToken,
      });

      const { data } = await client.fetch({
        document: ProductPricingAndRelatedProductsQuery,
        variables,
        customerAccessToken,
        fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
      });

      const product = data.site.product;
      
      if (product) {
        addSpanAttributes({
          'product.has_pricing': !!product.prices,
          'product.related_products_count': product.relatedProducts?.edges?.length || 0,
          'product.price_value': product.prices?.price?.value || 0,
          'product.price_currency': product.prices?.price?.currencyCode || 'unknown',
        });
      }

      return product;
    });
  },
);
