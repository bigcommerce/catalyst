import { NextRequest, NextResponse } from 'next/server';
import { hasLocale } from 'next-intl';

import { getProductsByIds } from '~/client/queries/get-products';
import { routing } from '~/i18n/routing';

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('ids');
  const locale = searchParams.get('locale') ?? routing.defaultLocale;

  if (!hasLocale(routing.locales, locale)) {
    return NextResponse.json(
      { status: 'error', error: 'Invalid locale parameter' },
      { status: 400 },
    );
  }

  if (query == null) {
    return NextResponse.json({ status: 'error', error: 'ids query is required' }, { status: 400 });
  }

  const idList = query.split(',');

  const ids = idList.map((id) => (id ? parseInt(id, 10) : null)).filter((id) => id !== null);

  const result =
    ids.length > 0
      ? await getProductsByIds({ entityIds: ids, locale })
      : { status: 'success', products: [] };

  return NextResponse.json(result);
};
