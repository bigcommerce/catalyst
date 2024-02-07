import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getRoute } from '~/client/queries/get-route';
import { kv } from '~/lib/kv';

import { withInternalAuth } from '../../internal-auth';

const BodySchema = z.object({
  pathname: z.string(),
});

const handler = async (request: NextRequest) => {
  const bodyJson: unknown = await request.json();
  const { pathname } = BodySchema.parse(bodyJson);

  const node = await getRoute(pathname);

  const expiryTime = Date.now() + 1000 * 60 * 30; // 30 minutes;

  try {
    await kv.set(`v2_${pathname}`, { node, expiryTime });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }

  return NextResponse.json(node);
};

export const POST = withInternalAuth(handler);

export const runtime = 'edge';
