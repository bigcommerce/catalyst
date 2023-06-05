import { bigcommerceFetch } from '@client/fetcher';

import {
  generateMutationOp,
  MutationGenqlSelection,
  MutationResult,
  UpdateCartLineItemDataInput,
} from '../generated';

export const updateCartLineItem = async (
  cartEntityId: string,
  lineItemEntityId: string,
  data: UpdateCartLineItemDataInput,
) => {
  const mutation = {
    cart: {
      updateCartLineItem: {
        __args: {
          input: {
            cartEntityId,
            lineItemEntityId,
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

  return response.data.cart.updateCartLineItem?.cart;
};
