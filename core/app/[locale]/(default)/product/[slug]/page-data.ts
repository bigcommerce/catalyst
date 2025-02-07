import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { PricingFragment } from '~/client/fragments/pricing';
import { graphql, VariablesOf } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { BreadcrumbsFragment } from '~/components/breadcrumbs/fragment';

const GalleryFragment = graphql(`
  fragment GalleryFragment on Product {
    images(first: 50) {
      # Increased limit to fetch all images
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
    videos {
      edges {
        node {
          title
          url
        }
      }
    }
  }
`);

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

const ProductFormFragment = graphql(
  `
    fragment ProductFormFragment on Product {
      entityId
      variants {
        edges {
          node {
            entityId
            sku
          }
        }
      }
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

export const ProductItemFragment = graphql(
  `
    fragment ProductItemFragment on Product {
      entityId
      name
      sku
      categories {
        edges {
          node {
            entityId
            name
            ...BreadcrumbsFragment
          }
        }
      }
      brand {
        name
        entityId
        id
      }
      ...PricingFragment
      ...ProductFormFragment
    }
  `,
  [BreadcrumbsFragment, PricingFragment, ProductFormFragment],
);

const ReviewSummaryFragment = graphql(`
  fragment ReviewSummaryFragment on Product {
    reviewSummary {
      numberOfReviews
      averageRating
    }
  }
`);

const ProductSchemaFragment = graphql(`
  fragment ProductSchemaFragment on Product {
    name
    path
    sku
    gtin
    mpn
    brand {
      name
      path
      id
    }
    reviewSummary {
      averageRating
      numberOfReviews
    }
    defaultImage {
      url: urlTemplate(lossy: true)
    }
    prices {
      price {
        value
        currencyCode
      }
      priceRange {
        min {
          value
        }
        max {
          value
        }
      }
    }
    condition
    availabilityV2 {
      status
    }
  }
`);

export const DetailsFragment = graphql(
  `
    fragment DetailsFragment on Product {
      ...ReviewSummaryFragment
      ...ProductSchemaFragment
      ...ProductFormFragment
      ...ProductItemFragment
      entityId
      name
      sku
      upc
      mpn
      minPurchaseQuantity
      maxPurchaseQuantity
      condition
      weight {
        value
        unit
      }
      availabilityV2 {
        description
      }
      customFields {
        edges {
          node {
            entityId
            name
            value
          }
        }
      }
      brand {
        name
        entityId
        id
      }
      ...PricingFragment
    }
  `,
  [
    ReviewSummaryFragment,
    ProductSchemaFragment,
    ProductFormFragment,
    ProductItemFragment,
    PricingFragment,
  ],
);

export const DescriptionFragment = graphql(`
  fragment DescriptionFragment on Product {
    description
    plainTextDescription(characterLimit: 1200)
  }
`);

export const WarrantyFragment = graphql(`
  fragment WarrantyFragment on Product {
    warranty
  }
`);

export const ProductPageQuery = graphql(
  `
    query ProductPageQuery(
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
          ...GalleryFragment
          ...DetailsFragment
          ...ProductItemFragment
          ...DescriptionFragment
          ...WarrantyFragment
          entityId
          name
          defaultImage {
            url: urlTemplate(lossy: true)
            altText
          }
          categories {
            edges {
              node {
                ...BreadcrumbsFragment
              }
            }
          }
          seo {
            pageTitle
            metaDescription
            metaKeywords
          }
        }
        parent: product(entityId: $entityId) {
          entityId
          sku
          mpn
        }
      }
    }
  `,
  [
    BreadcrumbsFragment,
    GalleryFragment,
    DetailsFragment,
    ProductItemFragment,
    DescriptionFragment,
    WarrantyFragment,
  ],
);

export const ProductPageSKUQuery = graphql(
  `
    query ProductPageSKUQuery($sku: String!) {
      site {
        product(sku: $sku) {
          ...GalleryFragment
          ...DetailsFragment
          ...ProductItemFragment
          ...DescriptionFragment
          ...WarrantyFragment
          entityId
          name
          defaultImage {
            url: urlTemplate(lossy: true)
            altText
          }
          categories {
            edges {
              node {
                ...BreadcrumbsFragment
              }
            }
          }
          seo {
            pageTitle
            metaDescription
            metaKeywords
          }
        }
        parent: product(sku: $sku) {
          entityId
          sku
          mpn
        }
      }
    }
  `,
  [
    BreadcrumbsFragment,
    GalleryFragment,
    DetailsFragment,
    ProductItemFragment,
    DescriptionFragment,
    WarrantyFragment,
  ],
);

type Variables = VariablesOf<typeof ProductPageQuery>;

export const getProduct = cache(async (variables: Variables) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const { data } = await client.fetch({
    document: ProductPageQuery,
    variables,
    customerAccessToken,
    fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
  });

  if (data.site && data.site.product && data.site.parent)
    data.site.product = {
      ...data.site.product,
      parent: data.site.parent,
    } as any;

  return data.site.product as any;
});

type SkuVariables = VariablesOf<typeof ProductPageSKUQuery>;

export const getProductBySku = cache(async (variables: SkuVariables) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const { data } = await client.fetch({
    document: ProductPageSKUQuery,
    variables,
    customerAccessToken,
    fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
  });

  if (data.site && data.site.product && data.site.parent)
    data.site.product = {
      ...data.site.product,
      parent: data.site.parent,
    } as any;

  return data.site.product as any;
});
