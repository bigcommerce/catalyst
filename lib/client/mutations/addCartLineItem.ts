import { bigcommerceFetch } from '@client/fetcher';

import {
  AddCartLineItemsDataInput,
  generateMutationOp,
  MutationGenqlSelection,
  MutationResult,
} from '../generated';

export const addCartLineItem = async (cartEntityId: string, data: AddCartLineItemsDataInput) => {
  const mutation = {
    cart: {
      addCartLineItems: {
        __args: {
          input: {
            cartEntityId,
            data,
          },
        },
        cart: {
          entityId: true,
        },
      },
    },
  } satisfies MutationGenqlSelection;

  const mutationOp = generateMutationOp(mutation);

  const response = await bigcommerceFetch<MutationResult<typeof mutation>>({
    ...mutationOp,
    cache: 'no-store',
  });

  return response.data.cart.addCartLineItems?.cart;
};
