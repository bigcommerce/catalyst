import { NextRequest, NextResponse } from 'next/server';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, ResultOf } from '~/client/graphql';
import { MakeswiftProductCardFragment } from '~/lib/makeswift/components/product-card/fragment';

const GetProduct = graphql(
  `
    query GetProduct($entityId: Int!) {
      site {
        product(entityId: $entityId) {
          ...MakeswiftProductCardFragment
        }
      }
    }
  `,
  [MakeswiftProductCardFragment],
);

export type GetProductResponse = ResultOf<typeof GetProduct>['site']['product'];

export const GET = async (
  _request: NextRequest,
  { params }: { params: { entityId: string } },
): Promise<NextResponse<GetProductResponse>> => {
  const customerAccessToken = await getSessionCustomerAccessToken();
  const { entityId } = params;

  const { data } = await client.fetch({
    document: GetProduct,
    customerAccessToken,
    variables: { entityId: parseInt(entityId, 10) },
  });

  return NextResponse.json(data.site.product);
};

export const runtime = 'edge';
