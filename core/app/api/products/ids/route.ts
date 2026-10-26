import { NextRequest, NextResponse } from 'next/server';
import { hasLocale } from 'next-intl';

import { getProductsByIds } from '~/client/queries/get-products';
import { revalidate } from '~/client/revalidate-target';
import { getLocaleRouting } from '~/i18n/locale-config';
import {
  getProductsCacheControl,
  normalizeProductIds,
  parseProductsViewer,
} from '~/lib/makeswift/utils/products-api';

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('ids');
  const { locales, defaultLocale } = await getLocaleRouting();

  const locale = searchParams.get('locale') ?? defaultLocale;

  if (!hasLocale(locales, locale)) {
    return NextResponse.json(
      { status: 'error', error: 'Invalid locale parameter' },
      { status: 400 },
    );
  }

  if (query == null) {
    return NextResponse.json({ status: 'error', error: 'ids query is required' }, { status: 400 });
  }

  const viewerResult = parseProductsViewer(searchParams);

  if (!viewerResult.success) {
    return NextResponse.json(
      { status: 'error', error: 'Invalid currency parameter' },
      { status: 400 },
    );
  }

  const { viewer } = viewerResult;
  const ids = normalizeProductIds(query.split(','));

  const result =
    ids.length > 0
      ? await getProductsByIds({ entityIds: ids, locale, viewer })
      : { status: 'success', products: [] };

  return NextResponse.json(result, {
    headers: {
      'Cache-Control': getProductsCacheControl(viewer, result.status === 'success', revalidate),
    },
  });
};
