import { cache } from 'react';

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

export const ProductFormFragment = graphql(
  `
    fragment ProductFormFragment on Product {
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
      inventory {
        isInStock
      }
      availabilityV2 {
        status
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

const StaticProductPageQuery = graphql(`
  query StaticProductPageQuery($entityId: Int!) {
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
      }
    }
  }
`);

export const getStaticProductPageData = cache(async (entityId: number) => {
  const { data } = await client.fetch({
    document: StaticProductPageQuery,
    variables: { entityId },
  });

  return data.site.product;
});

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

export const getProductMetadata = cache(async (entityId: number) => {
  const { data } = await client.fetch({
    document: ProductMetadataQuery,
    variables: { entityId },
  });

  return data.site.product;
});

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

export const getProductPageData = cache(
  async (variables: Variables, customerAccessToken?: string) => {
    const { data } = await client.fetch({
      document: ProductPageQuery,
      variables,
      customerAccessToken,
      fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
    });

    return data.site.product;
  },
);
