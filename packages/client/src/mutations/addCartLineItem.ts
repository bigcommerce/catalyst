import { BigCommerceResponse, FetcherInput } from '../fetcher';
import {
  AddCartLineItemsDataInput,
  generateMutationOp,
  MutationGenqlSelection,
  MutationResult,
} from '../generated';

export const addCartLineItem = async <T>(
  customFetch: <U>(data: FetcherInput) => Promise<BigCommerceResponse<U>>,
  cartEntityId: string,
  data: AddCartLineItemsDataInput,
  config: T = { cache: 'no-store' } as T,
) => {
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

  const response = await customFetch<MutationResult<typeof mutation>>({
    ...mutationOp,
    ...config,
  });

  return response.data.cart.addCartLineItems?.cart;
};
