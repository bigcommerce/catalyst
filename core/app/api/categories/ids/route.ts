import { NextRequest, NextResponse } from 'next/server';

import { getCategoriesByIds } from '~/client/queries/get-categories';

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('ids');

  if (query == null) {
    return NextResponse.json({ status: 'error', error: 'ids query is required' }, { status: 400 });
  }

  const idList = query.split(',');

  const ids = idList.map((id) => (id ? parseInt(id, 10) : null)).filter((id) => id !== null);

  const result =
    ids.length > 0 ? await getCategoriesByIds(ids) : { status: 'success', categories: [] };

  return NextResponse.json(result);
};
