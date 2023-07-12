import { BigCommerceResponse, FetcherInput } from '../fetcher';
import {
  generateMutationOp,
  MutationGenqlSelection,
  MutationResult,
  UpdateCartLineItemDataInput,
} from '../generated';

export const updateCartLineItem = async <T>(
  customFetch: <U>(data: FetcherInput) => Promise<BigCommerceResponse<U>>,
  cartEntityId: string,
  lineItemEntityId: string,
  data: UpdateCartLineItemDataInput,
  config: T = { cache: 'no-store' } as T,
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

  const response = await customFetch<MutationResult<typeof mutation>>({
    ...mutationOp,
    ...config,
  });

  return response.data.cart.updateCartLineItem?.cart;
};
