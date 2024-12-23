import { NextRequest, NextResponse } from 'next/server';

import { getSearchResults } from '~/client/queries/get-search-results';
import { ExistingResultType } from '~/client/util';

export type SearchProductsResponse = ExistingResultType<typeof getSearchResults>;

export const GET = async (request: NextRequest): Promise<NextResponse<SearchProductsResponse>> => {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('search');

  if (query == null) {
    return NextResponse.json(
      { status: 'error', error: 'Search query is required' },
      { status: 400 },
    );
  }

  const result = await getSearchResults(query);

  return NextResponse.json(result);
};
