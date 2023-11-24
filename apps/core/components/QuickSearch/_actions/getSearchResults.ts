'use server';

import client from '~/client';

export async function getSearchResults(searchTerm: string) {
  const searchResults = await client.getQuickSearchResults(searchTerm);

  return searchResults;
}
