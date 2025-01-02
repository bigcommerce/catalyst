import { NextRequest, NextResponse } from 'next/server';
import { GetCartMetaFields } from '~/components/management-apis';
 
export const GET = async (request: NextRequest, { params }: { params: { cartId: string } }): Promise<NextResponse<[]>> => {
  const { cartId } = params;

  const searchParams = request.nextUrl.searchParams;
  const locale = searchParams.get('locale') ?? undefined;

  if (cartId) {
    let getCartMetaFields = await GetCartMetaFields(cartId, 'accessories_data');
    if(!getCartMetaFields?.length) {
      getCartMetaFields = [];
    }
    return NextResponse.json(getCartMetaFields);
  }

  return NextResponse.json([]);
};

export const runtime = 'edge';