import { NextRequest, NextResponse } from 'next/server';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, ResultOf } from '~/client/graphql';
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
  _request: NextRequest,
  { params }: { params: Promise<{ entityId: string }> },
): Promise<NextResponse<GetProductResponse>> => {
  const customerAccessToken = await getSessionCustomerAccessToken();
  const currencyCode = await getPreferredCurrencyCode();
  const { entityId } = await params;

  const { data } = await client.fetch({
    document: GetProduct,
    customerAccessToken,
    variables: { entityId: parseInt(entityId, 10), currencyCode },
  });

  return NextResponse.json(data.site.product);
};
