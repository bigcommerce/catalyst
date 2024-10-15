import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';

import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { graphql, VariablesOf } from '../graphql';

const DELETE_WISHLIST_ITEMS_MUTATION = graphql(`
  mutation deleteWishlistItems($input: DeleteWishlistItemsInput!, $hideOutOfStock: Boolean) {
    wishlist {
      deleteWishlistItems(input: $input) {
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

type Variables = VariablesOf<typeof DELETE_WISHLIST_ITEMS_MUTATION>;
type Input = Variables['input'];

export interface DeleteWishlistItems {
  input: Input;
  hideOutOfStock?: boolean;
}

export const deleteWishlistItems = async ({
  hideOutOfStock = false,
  input,
}: DeleteWishlistItems) => {
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: DELETE_WISHLIST_ITEMS_MUTATION,
    variables: { hideOutOfStock, input },
    customerId,
    fetchOptions: { cache: 'no-store' },
  });

  const wishlist = response.data.wishlist.deleteWishlistItems?.result;

  if (!wishlist) {
    return undefined;
  }

  return {
    ...wishlist,
    items: removeEdgesAndNodes(wishlist.items),
  };
};
