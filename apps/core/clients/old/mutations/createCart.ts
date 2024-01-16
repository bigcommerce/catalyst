import { BigCommerceResponse, FetcherInput } from '../fetcher';
import {
  CartLineItemInput,
  generateMutationOp,
  MutationGenqlSelection,
  MutationResult,
} from '../generated';

export const createCart = async <T>(
  customFetch: <U>(data: FetcherInput) => Promise<BigCommerceResponse<U>>,
  lineItems: CartLineItemInput[],
  config: T = { cache: 'no-store' } as T,
) => {
  const mutation = {
    cart: {
      createCart: {
        __args: {
          input: {
            lineItems,
          },
        },
        cart: {
          __scalar: true,
        },
      },
    },
  } satisfies MutationGenqlSelection;

  const mutationOp = generateMutationOp(mutation);

  const { data } = await customFetch<MutationResult<typeof mutation>>({
    ...mutationOp,
    ...config,
  });

  return data.cart.createCart?.cart;
};
