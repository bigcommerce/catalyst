'use server';

import { getQuickSearchResults } from '~/client/queries/get-quick-search-results';

export async function getSearchResults(searchTerm: string) {
  try {
    const searchResults = await getQuickSearchResults({
      searchTerm,
    });

    return { status: 'success', data: searchResults };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { status: 'error', error: error.message };
    }

    return { status: 'error', error: 'Something went wrong. Please try again.' };
  }
}
