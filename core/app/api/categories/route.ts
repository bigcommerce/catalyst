import { NextRequest, NextResponse } from 'next/server';

import { getCategorySearchResults } from '~/client/queries/get-search-results';
import { ExistingResultType } from '~/client/util';

export type SearchCategoriesResponse = ExistingResultType<typeof getCategorySearchResults>;

export const GET = async (
  request: NextRequest,
): Promise<NextResponse<SearchCategoriesResponse>> => {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('search');

  if (query == null) {
    return NextResponse.json(
      { status: 'error', error: 'Search query is required' },
      { status: 400 },
    );
  }

  const result = await getCategorySearchResults(query);

  return NextResponse.json(result);
};
