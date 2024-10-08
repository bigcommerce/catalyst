import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { graphql, VariablesOf } from '../graphql';

const UPDATE_WISHLIST_MUTATION = graphql(`
  mutation UpdateWishlist($input: UpdateWishlistInput!) {
    wishlist {
      updateWishlist(input: $input) {
        result {
          entityId
          name
        }
      }
    }
  }
`);

type Variables = VariablesOf<typeof UPDATE_WISHLIST_MUTATION>;
type Input = Variables['input'];

export interface UpdateWishlist {
  input: Input;
}

export const updateWishlist = async ({ input }: UpdateWishlist) => {
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: UPDATE_WISHLIST_MUTATION,
    variables: { input },
    customerId,
    fetchOptions: { cache: 'no-store' },
  });

  const updatedWishlist = response.data.wishlist.updateWishlist?.result;

  if (!updatedWishlist) {
    return undefined;
  }

  return updatedWishlist;
};
