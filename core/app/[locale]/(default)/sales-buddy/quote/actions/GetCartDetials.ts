'use server';

import { cache } from 'react';
import { graphql } from "~/client/graphql";
import { cookies } from "next/headers";
import { getSessionCustomerAccessToken } from "~/auth";
import { client } from '~/client';
import { TAGS } from "~/client/tags";


const MoneyFieldFragment = graphql(`
    fragment MoneyFieldFragment on Money {
      currencyCode
      value
    }
  `);


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
              imageUrl(height: 48, lossy: false, width: 48)
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
  
  
  const GetCartQuery = graphql(
    `
      query GetCartQuery($cartId: String) {
        site {
          cart(entityId: $cartId) {
            entityId
            isTaxIncluded
            currencyCode
            lineItems {
              totalQuantity
              physicalItems {
                name
                brand
                imageUrl
                entityId
                quantity
                sku
                productEntityId
                variantEntityId
                extendedListPrice {
                  ...MoneyFieldFragment
                }
                extendedSalePrice {
                  ...MoneyFieldFragment
                }
                originalPrice {
                  ...MoneyFieldFragment
                }
                listPrice {
                  ...MoneyFieldFragment
                }
                baseCatalogProduct {
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
                }
                selectedOptions {
                  __typename
                  entityId
                  name
                  ... on CartSelectedMultipleChoiceOption {
                    value
                    valueEntityId
                  }
                  ... on CartSelectedCheckboxOption {
                    value
                    valueEntityId
                  }
                  ... on CartSelectedNumberFieldOption {
                    number
                  }
                  ... on CartSelectedMultiLineTextFieldOption {
                    text
                  }
                  ... on CartSelectedTextFieldOption {
                    text
                  }
                  ... on CartSelectedDateFieldOption {
                    date {
                      utc
                    }
                  }
                }
              }
              digitalItems {
                name
                brand
                imageUrl
                entityId
                quantity
                productEntityId
                variantEntityId
                extendedListPrice {
                  ...MoneyFieldFragment
                }
                extendedSalePrice {
                  ...MoneyFieldFragment
                }
                originalPrice {
                  ...MoneyFieldFragment
                }
                listPrice {
                  ...MoneyFieldFragment
                }
                selectedOptions {
                  __typename
                  entityId
                  name
                  ... on CartSelectedMultipleChoiceOption {
                    value
                    valueEntityId
                  }
                  ... on CartSelectedCheckboxOption {
                    value
                    valueEntityId
                  }
                  ... on CartSelectedNumberFieldOption {
                    number
                  }
                  ... on CartSelectedMultiLineTextFieldOption {
                    text
                  }
                  ... on CartSelectedTextFieldOption {
                    text
                  }
                  ... on CartSelectedDateFieldOption {
                    date {
                      utc
                    }
                  }
                }
              }
              customItems {
                name
                sku
                entityId
                quantity

                listPrice {
                  currencyCode
                  value
                }
              }
            }
            amount {
              ...MoneyFieldFragment
            }
            discountedAmount {
              ...MoneyFieldFragment
            }
          }
        }
      }
    `,
    [
      MoneyFieldFragment,
      MultipleChoiceFieldFragment,
      CheckboxFieldFragment,
      NumberFieldFragment,
      TextFieldFragment,
      MultiLineTextFieldFragment,
      DateFieldFragment,
    ],
  );
          

export const GetCartDetials = cache(async (channelId?:string) => {
    try {
        const cookieStore = await cookies();       
        const cartId = cookieStore.get('cartId')?.value;
            const customerAccessToken = await getSessionCustomerAccessToken();

              const response = await client.fetch({
                document: GetCartQuery,
                variables: { cartId },
                customerAccessToken,
                fetchOptions: {
                  cache: 'no-store',
                  next: {
                    tags: [TAGS.cart],
                  },
                },
                channelId,
              });
              const cartData = response.data.site.cart;

              if (!cartData) {
                return;
              }
               return cartData;
            }
            catch(error: any) {
                console.error('Error fetching cart data:', error);
                return { status: 500, error: error.message || 'An unknown error occurred' };
            }
  
});