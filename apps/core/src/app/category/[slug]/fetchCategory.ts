import { cache } from 'react';

import client from '~/client';

export interface FetchCategoryParams {
  categoryId: number;
  limit?: number;
  after?: string;
  before?: string;
}

export const fetchCategory = cache(
  // We need to make sure the reference passed into this function is the same if we want it to be memoized.
  async ({ categoryId, limit = 4, after, before }: FetchCategoryParams) => {
    return client.getProductSearchResults({
      categoryEntityId: categoryId,
      limit,
      after,
      before,
    });
  },
);
