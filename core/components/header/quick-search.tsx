'use client';

import { useFormatter } from 'next-intl';

import { getQuickSearchResults } from '~/client/queries/get-quick-search-results';
import { ExistingResultType } from '~/client/util';
import { searchResultsTransformer } from '~/data-transformers/search-results-transformer';

import { Search } from '../ui/header';

import { getSearchResults } from './_actions/get-search-results';

interface Image {
  src: string;
  altText: string;
}

interface SearchProps {
  logo: string | Image;
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

  const fetchSearchResults = async (term: string) => {
    const { data: searchResults } = await getSearchResults(term);

    if (isSearchQuery(searchResults)) {
      return searchResultsTransformer(searchResults, format);
    }

    return null;
  };

  return <Search logo={logo} onSearch={fetchSearchResults} />;
};
