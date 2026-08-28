import { NextRequest, NextResponse } from 'next/server';
import { hasLocale } from 'next-intl';
import { z } from 'zod';

import {
  getBestSellingProducts,
  getFeaturedProducts,
  getNewestProducts,
} from '~/client/queries/get-products';
import { getLocaleRouting } from '~/i18n/locale-config';

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
      result = await getBestSellingProducts({ locale });
      break;

    case 'featured':
      result = await getFeaturedProducts({ locale });
      break;

    case 'newest':
      result = await getNewestProducts({ locale });
      break;
  }

  return NextResponse.json(result);
};
