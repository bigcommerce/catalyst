import { DocumentNode, print } from '@0no-co/graphql.web';

import { DocumentDecoration } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeQuery(query: string | DocumentNode | DocumentDecoration<any, any>) {
  if (typeof query === 'string') {
    return query;
  }

  if (query instanceof String) {
    return query.toString();
  }

  if ('kind' in query) {
    return print(query);
  }

  throw new Error('Invalid query type');
}
