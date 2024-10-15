import { draftMode } from 'next/headers';
import { NextRequest } from 'next/server';

export const GET = (request: NextRequest) => {
  if (request.headers.get('x-makeswift-api-key') === process.env.MAKESWIFT_SITE_API_KEY) {
    draftMode().enable();
  }

  return new Response(null);
};
