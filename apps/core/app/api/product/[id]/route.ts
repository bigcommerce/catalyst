/*
 * This route handler is exclusively for use by the product sheet component.
 */
import { NextRequest, NextResponse } from 'next/server';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { ProductSheetContentFragment } from '~/components/product-sheet/fragment';

const GetProductQuery = graphql(
  `
    query GetProductQuery($productId: Int!, $optionValueIds: [OptionValueId!]) {
      site {
        product(entityId: $productId, optionValueIds: $optionValueIds) {
          ...ProductSheetContentFragment
        }
      }
    }
  `,
  [ProductSheetContentFragment],
);

export const GET = async (request: NextRequest, { params }: { params: { id: string } }) => {
  if (request.headers.get('x-catalyst-product-sheet') !== 'true') {
    return NextResponse.json(
      { status: 'error', message: 'Endpoint only available for product-sheet component.' },
      { status: 400 },
    );
  }

  const { id } = params;
  const searchParams = request.nextUrl.searchParams;

  const optionValueIds = Array.from(searchParams.entries(), ([option, value]) => ({
    optionEntityId: Number(option),
    valueEntityId: Number(value),
  })).filter(
    (option) => !Number.isNaN(option.optionEntityId) && !Number.isNaN(option.valueEntityId),
  );

  if (id) {
    const { data } = await client.fetch({
      document: GetProductQuery,
      variables: { productId: Number(id), optionValueIds },
    });

    return NextResponse.json(data.site.product);
  }

  return NextResponse.json({ status: 'error', message: 'Missing product id.' }, { status: 400 });
};

export const runtime = 'edge';
