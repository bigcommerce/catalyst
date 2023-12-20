'use server';

import { getQuickSearchResults } from '~/client/queries/getQuickSearchResults';

export async function getSearchResults(searchTerm: string) {
  const searchResults = await getQuickSearchResults(searchTerm);

  return searchResults;
}
