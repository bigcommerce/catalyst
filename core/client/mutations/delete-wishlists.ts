import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { graphql, VariablesOf } from '../graphql';

const DELETE_WISHLISTS_MUTATION = graphql(`
  mutation DeleteWishlists($input: DeleteWishlistsInput!) {
    wishlist {
      deleteWishlists(input: $input) {
        result
      }
    }
  }
`);

type Variables = VariablesOf<typeof DELETE_WISHLISTS_MUTATION>;
type Input = Variables['input'];

export interface DeleteWishlists {
  input: Input;
}

export const deleteWishlists = async ({ input }: DeleteWishlists) => {
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: DELETE_WISHLISTS_MUTATION,
    variables: { input },
    customerId,
    fetchOptions: { cache: 'no-store' },
  });

  return response.data.wishlist.deleteWishlists?.result;
};
