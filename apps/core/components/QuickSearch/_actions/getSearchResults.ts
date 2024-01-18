'use server';

import { getQuickSearchResults } from '~/client/queries/getQuickSearchResults';

export async function getSearchResults(searchTerm: string) {
  const searchResults = await getQuickSearchResults({
    searchTerm,
    imageHeight: 150,
    imageWidth: 150,
  });

  return searchResults;
}
