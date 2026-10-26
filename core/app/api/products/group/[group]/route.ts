import { NextRequest, NextResponse } from 'next/server';
import { hasLocale } from 'next-intl';
import { z } from 'zod';

import {
  getBestSellingProducts,
  getFeaturedProducts,
  getNewestProducts,
} from '~/client/queries/get-products';
import { revalidate } from '~/client/revalidate-target';
import { getLocaleRouting } from '~/i18n/locale-config';
import { getProductsCacheControl, parseProductsViewer } from '~/lib/makeswift/utils/products-api';

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ group: string }> },
) => {
  const { group } = await params;
  const searchParams = request.nextUrl.searchParams;
  const { locales, defaultLocale } = await getLocaleRouting();

  const locale = searchParams.get('locale') ?? defaultLocale;

  if (!hasLocale(locales, locale)) {
    return NextResponse.json(
      { status: 'error', error: 'Invalid locale parameter' },
      { status: 400 },
    );
  }

  const viewerResult = parseProductsViewer(searchParams);

  if (!viewerResult.success) {
    return NextResponse.json(
      { status: 'error', error: 'Invalid currency parameter' },
      { status: 400 },
    );
  }

  const { viewer } = viewerResult;

  const querySchema = z.enum(['best-selling', 'featured', 'newest']);

  const parseResult = querySchema.safeParse(group);

  if (!parseResult.success) {
    return NextResponse.json(
      { status: 'error', error: 'Invalid group parameter' },
      { status: 400 },
    );
  }

  let result;

  switch (parseResult.data) {
    case 'best-selling':
      result = await getBestSellingProducts({ locale, viewer });
      break;

    case 'featured':
      result = await getFeaturedProducts({ locale, viewer });
      break;

    case 'newest':
      result = await getNewestProducts({ locale, viewer });
      break;
  }

  return NextResponse.json(result, {
    headers: {
      'Cache-Control': getProductsCacheControl(viewer, result.status === 'success', revalidate),
    },
  });
};
