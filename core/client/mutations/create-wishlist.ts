import { getSessionCustomerId } from '~/auth';

import { client } from '..';
import { graphql, VariablesOf } from '../graphql';

const CREATE_WISHLIST_MUTATION = graphql(`
  mutation CreateWishlist($input: CreateWishlistInput!) {
    wishlist {
      createWishlist(input: $input) {
        result {
          entityId
          name
        }
      }
    }
  }
`);

type Variables = VariablesOf<typeof CREATE_WISHLIST_MUTATION>;
type Input = Variables['input'];

export interface CreateWishlist {
  input: Input;
}

export const createWishlist = async ({ input }: CreateWishlist) => {
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: CREATE_WISHLIST_MUTATION,
    variables: { input },
    customerId,
    fetchOptions: { cache: 'no-store' },
  });

  const newWishlist = response.data.wishlist.createWishlist?.result;

  if (!newWishlist) {
    return undefined;
  }

  return newWishlist;
};
