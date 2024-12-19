import { notFound } from 'next/navigation';
import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
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
      plainTextDescription
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
      ...PricingFragment
      ...ProductFormFragment
    }
  `,
  [PricingFragment, ProductFormFragment],
);

// TODO: Add this fragment to the query when we add the other sections
// const DetailsFragment = graphql(
//   `
//     fragment DetailsFragment on Product {
//       ...ReviewSummaryFragment
//       ...ProductFormFragment
//       ...ProductDetailsFragment
//       entityId
//       name
//       sku
//       upc
//       minPurchaseQuantity
//       maxPurchaseQuantity
//       condition
//       weight {
//         value
//         unit
//       }
//       availabilityV2 {
//         description
//       }
//       customFields {
//         edges {
//           node {
//             entityId
//             name
//             value
//           }
//         }
//       }
//       brand {
//         name
//       }
//       ...PricingFragment
//     }
//   `,
//   [ReviewSummaryFragment, ProductFormFragment, ProductDetailsFragment, PricingFragment],
// );

// export const DescriptionFragment = graphql(`
//   fragment DescriptionFragment on Product {
//     description
//     # plainTextDescription(characterLimit: 1200)
//     plainTextDescription
//   }
// `);

const ProductPageQuery = graphql(
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
          ...ProductDetailsFragment
          ...ProductViewedFragment
          ...ProductSchemaFragment
          # TODO: Add this fragment to the query when we add the other sections
          # ...DetailsFragment
          # ...DescriptionFragment
          # ...WarrantyFragment
          name
          plainTextDescription
          defaultImage {
            url: urlTemplate(lossy: true)
            altText
          }
          seo {
            pageTitle
            metaDescription
            metaKeywords
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
    // DetailsFragment,
    // DescriptionFragment,
    // WarrantyFragment,
  ],
);

type Variables = VariablesOf<typeof ProductPageQuery>;

export const getProductData = cache(async (variables: Variables) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const { data } = await client.fetch({
    document: ProductPageQuery,
    variables,
    customerAccessToken,
    fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
  });

  const product = data.site.product;

  if (!product) {
    return notFound();
  }

  return product;
});
