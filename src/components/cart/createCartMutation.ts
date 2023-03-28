import { gql } from '@apollo/client';

export const createCartMutation = gql`
  mutation createCartSimple($createCartInput: CreateCartInput!) {
    cart {
      createCart(input: $createCartInput) {
        cart {
          entityId
          lineItems {
            physicalItems {
              name
              quantity
            }
            digitalItems {
              name
              quantity
            }
            giftCertificates {
              name
            }
            customItems {
              name
              quantity
            }
          }
        }
      }
    }
  }
`;
