'use client';

import { useFormatter } from 'next-intl';
import { ReactNode } from 'react';

import { getQuickSearchResults } from '~/client/queries/get-quick-search-results';
import { ExistingResultType } from '~/client/util';
import { searchResultsTransformer } from '~/data-transformers/search-results-transformer';

import { Search, type SearchResults } from '../ui/search';

import { getSearchResults } from './_actions/get-search-results';

interface SearchProps {
  logo: ReactNode;
}

type QuickSearchResults = ExistingResultType<typeof getQuickSearchResults>;

const isSearchQuery = (data: unknown): data is QuickSearchResults => {
  if (typeof data === 'object' && data !== null && 'products' in data) {
    return true;
  }

  return false;
};

export const QuickSearch = ({ logo }: SearchProps) => {
  const format = useFormatter();

  const fetchSearchResults = async (
    term: string,
    setSearchResults: React.Dispatch<React.SetStateAction<SearchResults | null>>,
  ) => {
    const { data: searchResults } = await getSearchResults(term);

    if (isSearchQuery(searchResults)) {
      setSearchResults(searchResultsTransformer(searchResults, format));
    }
  };

  return <Search logo={logo} onSearch={fetchSearchResults} />;
};
