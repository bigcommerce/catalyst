import { MutationOptions, QueryOptions } from '@apollo/client';

const fetchFn = async (body: QueryOptions | MutationOptions) => {
  if (typeof window === 'undefined') {
    throw new Error(
      'getBrowserClient is only for use in the browser. Use getServerClient for server requests.',
    );
  }

  console.log(body, 'body in fetchFn');

  const response = await fetch('/api/graphql', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const parsed: unknown = await response.json();

  return typeof parsed === 'object' && parsed && 'data' in parsed ? parsed.data : parsed;
};

export const getBrowserClient = () => {
  return {
    query: async (options: QueryOptions) => {
      return fetchFn(options);
    },
    mutate: async (options: MutationOptions) => {
      return fetchFn(options);
    },
  };
};
