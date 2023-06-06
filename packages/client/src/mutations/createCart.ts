import { bigcommerceFetch } from '../fetcher';
import {
  CartLineItemInput,
  generateMutationOp,
  MutationGenqlSelection,
  MutationResult,
} from '../generated';

export const createCart = async (lineItems: CartLineItemInput[]) => {
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

  const { data } = await bigcommerceFetch<MutationResult<typeof mutation>>({
    ...mutationOp,
    cache: 'no-store',
  });

  return data.cart.createCart?.cart;
};
