import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';

import { getSessionCustomerAccessToken } from '~/auth';

import { client } from '..';
import { graphql, VariablesOf } from '../graphql';

const ADD_WISHLIST_ITEMS_MUTATION = graphql(`
  mutation addWishlistItems($input: AddWishlistItemsInput!, $hideOutOfStock: Boolean) {
    wishlist {
      addWishlistItems(input: $input) {
        result {
          entityId
          name
          items(hideOutOfStock: $hideOutOfStock) {
            edges {
              node {
                entityId
                product {
                  name
                  entityId
                }
              }
            }
          }
        }
      }
    }
  }
`);

type Variables = VariablesOf<typeof ADD_WISHLIST_ITEMS_MUTATION>;
type Input = Variables['input'];

export interface AddWishlistItems {
  hideOutOfStock?: boolean;
  input: Input;
}

export const addWishlistItems = async ({ hideOutOfStock = false, input }: AddWishlistItems) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const response = await client.fetch({
    document: ADD_WISHLIST_ITEMS_MUTATION,
    variables: { hideOutOfStock, input },
    customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });

  const wishlist = response.data.wishlist.addWishlistItems?.result;

  if (!wishlist) {
    return undefined;
  }

  return {
    ...wishlist,
    items: removeEdgesAndNodes(wishlist.items),
  };
};
