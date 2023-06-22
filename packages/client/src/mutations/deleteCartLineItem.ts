import { BigCommerceResponse, FetcherInput } from '../fetcher';
import { generateMutationOp, MutationGenqlSelection, MutationResult } from '../generated';

export const deleteCartLineItem = async <T>(
  customFetch: <U>(data: FetcherInput) => Promise<BigCommerceResponse<U>>,
  cartEntityId: string,
  lineItemEntityId: string,
  config: T = { cache: 'no-store' } as T,
) => {
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

  const { data } = await customFetch<MutationResult<typeof mutation>>({
    ...mutationOp,
    ...config,
  });

  return data.cart.deleteCartLineItem?.cart;
};
