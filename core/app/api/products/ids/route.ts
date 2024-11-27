import { NextRequest, NextResponse } from 'next/server';

import { getProductsByIds } from '~/client/queries/get-products';

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('ids');

  if (query == null) {
    return NextResponse.json({ status: 'error', error: 'ids query is required' }, { status: 400 });
  }

  const id_list = query.split(',');

  const ids = id_list.map((id) => (id ? parseInt(id, 10) : null)).filter((id) => id !== null);

  const result = ids.length ? await getProductsByIds(ids) : { status: 'success', products: [] };

  return NextResponse.json(result);
};

export const runtime = 'edge';
