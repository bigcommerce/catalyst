'use server';

import { getQuickSearchResults } from '~/clients/new/queries/getQuickSearchResults';

export async function getSearchResults(searchTerm: string) {
  const searchResults = await getQuickSearchResults(searchTerm);

  return searchResults;
}
