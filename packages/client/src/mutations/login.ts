import { BigCommerceResponse, FetcherInput } from '../fetcher';
import { generateMutationOp, MutationGenqlSelection, MutationResult } from '../generated';

export const login = async <T>(
  customFetch: <U>(data: FetcherInput) => Promise<BigCommerceResponse<U>>,
  email: string,
  password: string,
  config: T = { cache: 'no-store' } as T,
) => {
  const mutation = {
    login: {
      __args: {
        email,
        password,
      },
      customer: {
        customerGroupId: true,
        company: true,
        email: true,
        entityId: true,
        firstName: true,
        lastName: true,
        notes: true,
        phone: true,
      },
    },
  } satisfies MutationGenqlSelection;

  const mutationOp = generateMutationOp(mutation);

  const response = await customFetch<MutationResult<typeof mutation>>({
    ...mutationOp,
    ...config,
  });

  return response.data.login.customer;
};
