import { gql } from '@apollo/client';

export const getSmallCartQueryWithId = gql`
  query getCart($entityId: String!) {
    site {
      cart(entityId: $entityId) {
        entityId
        currencyCode
        isTaxIncluded
      }
    }
  }
`;

export const getCartQueryWithId = gql`
  query getCart($entityId: String!) {
    site {
      cart(entityId: $entityId) {
        entityId
        currencyCode
        isTaxIncluded
        baseAmount {
          currencyCode
          value
        }
        discountedAmount {
          currencyCode
          value
        }
        amount {
          currencyCode
          value
        }
        discounts {
          entityId
          discountedAmount {
            currencyCode
            value
          }
        }
        lineItems {
          physicalItems {
            entityId
            parentEntityId
            variantEntityId
            productEntityId
            sku
            name
            url
            imageUrl
            brand
            quantity
            isTaxable
            discounts {
              entityId
              discountedAmount {
                currencyCode
                value
              }
            }
            discountedAmount {
              currencyCode
              value
            }
            couponAmount {
              currencyCode
              value
            }
            listPrice {
              currencyCode
              value
            }
            originalPrice {
              currencyCode
              value
            }
            salePrice {
              currencyCode
              value
            }
            extendedListPrice {
              currencyCode
              value
            }
            extendedSalePrice {
              currencyCode
              value
            }
            isShippingRequired
            selectedOptions {
              entityId
              name
              ... on CartSelectedCheckboxOption {
                value
                valueEntityId
              }
              ... on CartSelectedDateFieldOption {
                date {
                  utc
                }
              }
              ... on CartSelectedFileUploadOption {
                fileName
              }
              ... on CartSelectedMultiLineTextFieldOption {
                text
              }
              ... on CartSelectedMultipleChoiceOption {
                value
                valueEntityId
              }
              ... on CartSelectedNumberFieldOption {
                number
              }
              ... on CartSelectedTextFieldOption {
                text
              }
            }
            giftWrapping {
              name
              amount {
                currencyCode
                value
              }
              message
            }
          }
          digitalItems {
            entityId
            parentEntityId
            variantEntityId
            productEntityId
            sku
            name
            url
            imageUrl
            brand
            quantity
            isTaxable
            discounts {
              entityId
              discountedAmount {
                currencyCode
                value
              }
            }
            discountedAmount {
              currencyCode
              value
            }
            couponAmount {
              currencyCode
              value
            }
            listPrice {
              currencyCode
              value
            }
            originalPrice {
              currencyCode
              value
            }
            salePrice {
              currencyCode
              value
            }
            extendedListPrice {
              currencyCode
              value
            }
            extendedSalePrice {
              currencyCode
              value
            }
            selectedOptions {
              entityId
              name
              ... on CartSelectedCheckboxOption {
                value
                valueEntityId
              }
              ... on CartSelectedDateFieldOption {
                date {
                  utc
                }
              }
              ... on CartSelectedFileUploadOption {
                fileName
              }
              ... on CartSelectedMultiLineTextFieldOption {
                text
              }
              ... on CartSelectedMultipleChoiceOption {
                value
                valueEntityId
              }
              ... on CartSelectedNumberFieldOption {
                number
              }
              ... on CartSelectedTextFieldOption {
                text
              }
            }
          }
          giftCertificates {
            entityId
            name
            theme
            amount {
              currencyCode
              value
            }
            isTaxable
            sender {
              name
              email
            }
            recipient {
              name
              email
            }
            message
          }
          customItems {
            entityId
            sku
            name
            quantity
            listPrice {
              currencyCode
              value
            }
            extendedListPrice {
              currencyCode
              value
            }
          }
          totalQuantity
        }
        createdAt {
          utc
        }
        updatedAt {
          utc
        }
        locale
      }
    }
  }
`;

export const getCartQuery = gql`
  query getCart {
    site {
      cart {
        entityId
        currencyCode
        isTaxIncluded
        baseAmount {
          currencyCode
          value
        }
        discountedAmount {
          currencyCode
          value
        }
        amount {
          currencyCode
          value
        }
        discounts {
          entityId
          discountedAmount {
            currencyCode
            value
          }
        }
        lineItems {
          physicalItems {
            entityId
            parentEntityId
            variantEntityId
            productEntityId
            sku
            name
            url
            imageUrl
            brand
            quantity
            isTaxable
            discounts {
              entityId
              discountedAmount {
                currencyCode
                value
              }
            }
            discountedAmount {
              currencyCode
              value
            }
            couponAmount {
              currencyCode
              value
            }
            listPrice {
              currencyCode
              value
            }
            originalPrice {
              currencyCode
              value
            }
            salePrice {
              currencyCode
              value
            }
            extendedListPrice {
              currencyCode
              value
            }
            extendedSalePrice {
              currencyCode
              value
            }
            isShippingRequired
            selectedOptions {
              entityId
              name
              ... on CartSelectedCheckboxOption {
                value
                valueEntityId
              }
              ... on CartSelectedDateFieldOption {
                date {
                  utc
                }
              }
              ... on CartSelectedFileUploadOption {
                fileName
              }
              ... on CartSelectedMultiLineTextFieldOption {
                text
              }
              ... on CartSelectedMultipleChoiceOption {
                value
                valueEntityId
              }
              ... on CartSelectedNumberFieldOption {
                number
              }
              ... on CartSelectedTextFieldOption {
                text
              }
            }
            giftWrapping {
              name
              amount {
                currencyCode
                value
              }
              message
            }
          }
          digitalItems {
            entityId
            parentEntityId
            variantEntityId
            productEntityId
            sku
            name
            url
            imageUrl
            brand
            quantity
            isTaxable
            discounts {
              entityId
              discountedAmount {
                currencyCode
                value
              }
            }
            discountedAmount {
              currencyCode
              value
            }
            couponAmount {
              currencyCode
              value
            }
            listPrice {
              currencyCode
              value
            }
            originalPrice {
              currencyCode
              value
            }
            salePrice {
              currencyCode
              value
            }
            extendedListPrice {
              currencyCode
              value
            }
            extendedSalePrice {
              currencyCode
              value
            }
            selectedOptions {
              entityId
              name
              ... on CartSelectedCheckboxOption {
                value
                valueEntityId
              }
              ... on CartSelectedDateFieldOption {
                date {
                  utc
                }
              }
              ... on CartSelectedFileUploadOption {
                fileName
              }
              ... on CartSelectedMultiLineTextFieldOption {
                text
              }
              ... on CartSelectedMultipleChoiceOption {
                value
                valueEntityId
              }
              ... on CartSelectedNumberFieldOption {
                number
              }
              ... on CartSelectedTextFieldOption {
                text
              }
            }
          }
          giftCertificates {
            entityId
            name
            theme
            amount {
              currencyCode
              value
            }
            isTaxable
            sender {
              name
              email
            }
            recipient {
              name
              email
            }
            message
          }
          customItems {
            entityId
            sku
            name
            quantity
            listPrice {
              currencyCode
              value
            }
            extendedListPrice {
              currencyCode
              value
            }
          }
          totalQuantity
        }
        createdAt {
          utc
        }
        updatedAt {
          utc
        }
        locale
      }
    }
  }
`;
