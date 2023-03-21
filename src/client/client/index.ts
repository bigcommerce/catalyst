import { MutationOptions, QueryOptions } from '@apollo/client';

export { gql } from '@apollo/client';

const fetchFn = async (body: QueryOptions | MutationOptions) => {
  if (typeof window === 'undefined') {
    throw new Error(
      'This client is only for use in the browser. Use serverClient for server requests.',
    );
  }

  return fetch('/api/graphql', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
};

export const clientClient = {
  query: async (options: QueryOptions) => {
    return fetchFn(options);
  },
  mutate: async (options: MutationOptions) => {
    return fetchFn(options);
  },
};
