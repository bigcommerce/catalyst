`
        query {
          site {
            cart(entityId: "${cartId}") {
              currencyCode
              entityId
              id
              isTaxIncluded
              updatedAt {
                utc
              }
              createdAt {
                utc
              }
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
              baseAmount {
                currencyCode
                value
              }
              amount {
                currencyCode
                value
              }
              lineItems {
                customItems {
                  entityId
                  extendedListPrice {
                    value
                  }
                  listPrice {
                    value
                  }
                  name
                  quantity
                  sku
                }
                giftCertificates {
                  amount {
                    value
                  }
                  recipient {
                    email
                    name
                  }
                  sender {
                    email
                    name
                  }
                  theme
                  entityId
                  isTaxable
                  message
                  name
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
                    value
                  }
                  extendedSalePrice {
                    value
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
                physicalItems {
                  brand
                  couponAmount {
                    value
                    currencyCode
                  }
                  discountedAmount {
                    value
                  }
                  discounts {
                    discountedAmount {
                      value
                    }
                    entityId
                  }
                  extendedListPrice {
                    value
                  }
                  extendedSalePrice {
                    value
                  }
                  giftWrapping {
                    amount {
                      value
                    }
                    message
                    name
                  }
                  isShippingRequired
                  isTaxable
                  listPrice {
                    value
                  }
                  name
                  originalPrice {
                    value
                  }
                  entityId
                  quantity
                  salePrice {
                    value
                  }
                  sku
                  url
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
              }
            }
          }
        }
    `
