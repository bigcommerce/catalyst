import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';

import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { graphql, VariablesOf } from '../graphql';

const ADD_WISHLIST_ITEMS_MUTATION = graphql(`
  mutation addWishlistItems($input: AddWishlistItemsInput!) {
    wishlist {
      addWishlistItems(input: $input) {
        result {
          entityId
          name
          items {
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
  input: Input;
}

export const addWishlistItems = async ({ input }: AddWishlistItems) => {
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: ADD_WISHLIST_ITEMS_MUTATION,
    customerId,
    fetchOptions: { cache: 'no-store' },
    variables: { input },
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
