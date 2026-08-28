import { NextRequest, NextResponse } from 'next/server';
import { hasLocale } from 'next-intl';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, ResultOf } from '~/client/graphql';
import { getLocaleRouting } from '~/i18n/locale-config';
import { getPreferredCurrencyCode } from '~/lib/currency';
import { MakeswiftProductFragment } from '~/lib/makeswift/utils/use-bc-product-to-vibes-product/fragment';

const GetProduct = graphql(
  `
    query GetProduct($entityId: Int!, $currencyCode: currencyCode) {
      site {
        product(entityId: $entityId) {
          ...MakeswiftProductFragment
        }
      }
    }
  `,
  [MakeswiftProductFragment],
);

export type GetProductResponse = ResultOf<typeof GetProduct>['site']['product'];

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ entityId: string }> },
) => {
  const customerAccessToken = await getSessionCustomerAccessToken();
  const currencyCode = await getPreferredCurrencyCode();
  const searchParams = request.nextUrl.searchParams;
  const { locales, defaultLocale } = await getLocaleRouting();

  const locale = searchParams.get('locale') ?? defaultLocale;

  if (!hasLocale(locales, locale)) {
    return NextResponse.json(
      { status: 'error', error: 'Invalid locale parameter' },
      { status: 400 },
    );
  }

  const { entityId } = await params;

  const { data } = await client.fetch({
    document: GetProduct,
    customerAccessToken,
    variables: { entityId: parseInt(entityId, 10), currencyCode },
    fetchOptions: {
      headers: {
        'Accept-Language': locale,
      },
    },
  });

  return NextResponse.json(data.site.product);
};
