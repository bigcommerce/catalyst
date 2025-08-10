import { NextRequest, NextResponse } from 'next/server';

import axios from 'axios';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const appClientId = searchParams.get('app_client_id');

  if (!appClientId) {
    return NextResponse.json({ error: 'Missing app_client_id' }, { status: 400 });
  }

  // Call BigCommerce /customers/current.jwt endpoint
  try {
    const apiUrl = `https://store-wlbjjbyoi5.mybigcommerce.com/customer/current.jwt?app_client_id=${appClientId}`;
    const axiosResponse = await axios.get(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(axiosResponse);

    // The JWT is usually in axiosResponse.data.token
    return NextResponse.json({ jwt: axiosResponse.data.token });
  } catch (err: any) {
    if (err.response) {
      return NextResponse.json({ error: err.response.data }, { status: err.response.status });
    }
    return NextResponse.json(
      { error: 'Failed to fetch JWT', details: String(err) },
      { status: 500 },
    );
  }
}
