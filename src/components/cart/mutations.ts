import { gql } from '@apollo/client';

import { LineItems, physicalItemsFragment } from '../../pages/fragments';

export interface AddCartLineItemMutation {
  cart: {
    addCartLineItems: {
      cart: {
        entityId: number;
        isTaxIncluded: boolean;
        amount: {
          currencyCode: string;

          value: number;
        };
        lineItems: LineItems;
      };
    };
  };
}

export interface CreateCartMutation {
  cart: {
    createCart: {
      cart: {
        entityId: string;
        amount: {
          currencyCode: string;
          value: number;
        };
        lineItems: LineItems;
      };
    };
  };
}
export interface DeleteCartLineItemMutation {
  cart: {
    deleteCartLineItem: {
      deletedLineItemEntityId: string;
      cart: {
        entityId: number;
        amount: {
          currencyCode: string;

          value: number;
        };
        lineItems: LineItems;
      };
      deletedCartEntityId: string;
    };
  };
}

export interface DeleteCartMutation {
  cart: {
    deleteCart: {
      deletedCartEntityId: string;
    };
  };
}

export const addCartLineItemMutation = gql`
  mutation addCartLineItems($addCartLineItemsInput: AddCartLineItemsInput!) {
    cart {
      addCartLineItems(input: $addCartLineItemsInput) {
        cart {
          entityId
          amount {
			currencyCode
            value
          }
          lineItems {
            totalQuantity
            physicalItems {
              ...${physicalItemsFragment.fragmentName}
            }
          }
        }
      }
    }
  }
  ${physicalItemsFragment.fragment}
`;

export const createCartMutation = gql`
  mutation createCart($createCartInput: CreateCartInput!) {
    cart {
      createCart(input: $createCartInput) {
        cart {
          entityId
		  amount {
			currencyCode
            value
          }
          lineItems {
			totalQuantity
            physicalItems {
              ...${physicalItemsFragment.fragmentName}
            }
          }
        }
      }
    }
  }
  ${physicalItemsFragment.fragment}
`;

export const deleteCartLineItemMutation = gql`
  mutation deleteCartLineItem($deleteCartLineItemInput: DeleteCartLineItemInput!) {
    cart {
      deleteCartLineItem(input: $deleteCartLineItemInput) {
        deletedLineItemEntityId
        cart {
          entityId
          amount {
			currencyCode
            value
          }
          lineItems {
            physicalItems {
              ...${physicalItemsFragment.fragmentName}
            }
            totalQuantity
          }
        }
        deletedCartEntityId
      }
    }
  }
  ${physicalItemsFragment.fragment}
`;

export const deleteCartMutation = gql`
  mutation deleteCart($deleteCartInput: DeleteCartInput!) {
    cart {
      deleteCart(input: $deleteCartInput) {
        deletedCartEntityId
      }
    }
  }
`;
