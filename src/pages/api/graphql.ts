import { NextRequest, NextResponse } from 'next/server';

import { getServerClient } from '../../graphql/server';
import { MutationOptions, QueryOptions } from '../../graphql/utils';

const isQueryRequest = (body: unknown): body is QueryOptions => {
  return typeof body === 'object' && body !== null && 'query' in body;
};

const isMutationRequest = (body: unknown): body is MutationOptions => {
  return typeof body === 'object' && body !== null && 'mutation' in body;
};

export default async function graphqlHandler(req: NextRequest) {
  if (typeof req.method !== 'string') {
    return new NextResponse(
      JSON.stringify({
        data: {
          error: `No request method provided`,
        },
      }),
      {
        status: 405,
      },
    );
  }

  if (req.method !== 'POST') {
    return new NextResponse(
      JSON.stringify({
        data: {
          error: `Method ${req.method} not allowed`,
        },
      }),
      {
        status: 405,
      },
    );
  }

  const body: unknown = await req.json();
  const client = getServerClient();

  if (isQueryRequest(body)) {
    const response = await client.query(body);

    return new NextResponse(JSON.stringify(response));
  }

  if (isMutationRequest(body)) {
    const response = await client.mutate(body);

    return new NextResponse(JSON.stringify(response));
  }

  return new NextResponse(
    JSON.stringify({ data: { error: `Request body is invalid ${JSON.stringify(body)}` } }),
    { status: 400 },
  );
}
