import { NextRequest, NextResponse } from 'next/server';

import { getProduct } from '~/client/queries/get-product';

export const GET = async (request: NextRequest, { params }: { params: { id: string } }) => {
  const { id } = params;
  const searchParams = request.nextUrl.searchParams;

  const optionValueIds = Array.from(searchParams.entries(), ([option, value]) => ({
    optionEntityId: Number(option),
    valueEntityId: Number(value),
  })).filter(
    (option) => !Number.isNaN(option.optionEntityId) && !Number.isNaN(option.valueEntityId),
  );

  if (id) {
    const product = await getProduct(Number(id), optionValueIds);

    return NextResponse.json(product);
  }

  return new Response('Missing product id.', { status: 400 });
};

export const runtime = 'edge';
