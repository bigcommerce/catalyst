import { bigcommerceFetch } from '@client/fetcher';
import { generateMutationOp, MutationGenqlSelection, MutationResult } from '@client/generated';

export const deleteCartLineItem = async (cartEntityId: string, lineItemEntityId: string) => {
  const mutation = {
    cart: {
      deleteCartLineItem: {
        __args: {
          input: {
            cartEntityId,
            lineItemEntityId,
          },
        },
        cart: {
          entityId: true,
        },
      },
    },
  } satisfies MutationGenqlSelection;

  const mutationOp = generateMutationOp(mutation);

  const { data } = await bigcommerceFetch<MutationResult<typeof mutation>>({
    ...mutationOp,
    cache: 'no-store',
  });

  return data.cart.deleteCartLineItem?.cart;
};
