import { newClient } from '..';
import { graphql } from '../generated';
import { AddCartLineItemsDataInput } from '../generated/graphql';

export const ADD_TO_CART_LINE_ITEM_MUTATION = /* GraphQL */ `
  mutation AddCartLineItem($input: AddCartLineItemsInput!) {
    cart {
      addCartLineItems(input: $input) {
        cart {
          entityId
        }
      }
    }
  }
`;

export const addCartLineItem = async (cartEntityId: string, data: AddCartLineItemsDataInput) => {
  const mutation = graphql(ADD_TO_CART_LINE_ITEM_MUTATION);

  const response = await newClient.fetch({
    document: mutation,
    variables: { input: { cartEntityId, data } },
    fetchOptions: { cache: 'no-store' },
  });

  return response.data.cart.addCartLineItems?.cart;
};
