import { unstable_cache } from 'next/cache';

import { client } from '~/client';
import { PricingFragment } from '~/client/fragments/pricing';
import { graphql, VariablesOf } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { FeaturedProductsCarouselFragment } from '~/components/featured-products-carousel/fragment';

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

const ProductDetailsFragment = graphql(
  `
    fragment ProductDetailsFragment on Product {
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
      warranty
      inventory {
        isInStock
      }
      availabilityV2 {
        status
      }
      ...PricingFragment
    }
  `,
  [PricingFragment],
);

type Variables = VariablesOf<typeof ProductPageQuery>;

const ProductMetadataQuery = graphql(`
  query ProductMetadataQuery($entityId: Int!) {
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

export const getProductMetadata = unstable_cache(
  async (entityId: number, customerAccessToken?: string) => {
    const { data } = await client.fetch({
      document: ProductMetadataQuery,
      variables: { entityId },
      customerAccessToken,
      // fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
    });

    return data.site.product;
  },
  ['getProductMetadata'],
  { revalidate },
);

const BaseProductPageQuery = graphql(
  `
    query BaseProductPageQuery($entityId: Int!) {
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

export const getBaseProductPageData = unstable_cache(
  async (entityId: number, customerAccessToken?: string) => {
    const { data } = await client.fetch({
      document: BaseProductPageQuery,
      variables: { entityId },
      customerAccessToken,
      // fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
    });

    return data.site.product;
  },
  ['getBaseProductPageData'],
  { revalidate },
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
    FeaturedProductsCarouselFragment,
    ProductViewedFragment,
    ProductSchemaFragment,
  ],
);

export const getProductPageData = unstable_cache(
  async (variables: Variables, customerAccessToken?: string) => {
    const { data } = await client.fetch({
      document: ProductPageQuery,
      variables,
      customerAccessToken,
      // fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
    });

    return data.site.product;
  },
  ['getProductPageData'],
  { revalidate },
);
