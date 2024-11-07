import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { NextRequest, NextResponse } from 'next/server';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { FragmentOf, graphql } from '~/client/graphql';
import { MakeswiftProductFragment } from '~/makeswift/utils/use-bc-product-to-vibes-product/fragment';

const GetFeaturedProducts = graphql(
  `
    query GetFeaturedProducts {
      site {
        newestProducts(first: 12) {
          edges {
            node {
              ...MakeswiftProductFragment
            }
          }
        }
        featuredProducts(first: 12) {
          edges {
            node {
              ...MakeswiftProductFragment
            }
          }
        }
      }
    }
  `,
  [MakeswiftProductFragment],
);

export type GetFeaturedProductResponse = Array<FragmentOf<typeof MakeswiftProductFragment>>;

export const GET = async (
  request: NextRequest,
): Promise<NextResponse<GetFeaturedProductResponse>> => {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');

  const customerAccessToken = await getSessionCustomerAccessToken();

  const { data } = await client.fetch({
    document: GetFeaturedProducts,
    customerAccessToken,
  });

  if (type === 'newest') {
    return NextResponse.json(removeEdgesAndNodes(data.site.newestProducts));
  }

  return NextResponse.json(removeEdgesAndNodes(data.site.featuredProducts));
};

export const runtime = 'edge';
