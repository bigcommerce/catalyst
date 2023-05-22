import { NextRequest, NextResponse } from 'next/server';

import { createCartRedirectUrl } from '@api/server/storefront/checkout';

export default async function handler(req: NextRequest) {
  if (req.method === 'POST') {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      // todo middleware?
      throw new Error('id is required');
    }

    const data = await createCartRedirectUrl(id);

    if (data.data) {
      return new NextResponse(
        JSON.stringify({
          data: {
            url: data.data.checkout_url,
          },
        }),
        {
          status: 200,
        },
      );
    }

    // todo middleware?
    return new NextResponse(JSON.stringify(data), {
      status: data.status,
    });
  }

  // todo middleware?
  return new NextResponse(null, { status: 500 });
}
