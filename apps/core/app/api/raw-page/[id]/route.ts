import { NextRequest, NextResponse } from 'next/server';

import { getRawWebPageContent } from '~/client/queries/getRawWebPageContent';

export const GET = async (request: NextRequest, { params }: { params: { id: string } }) => {
  const { id } = params;

  if (id) {
    const page = await getRawWebPageContent(id);

    if (!page) {
      return new Response('Page not found.', { status: 404 });
    }

    // todo - support other content types
    return new NextResponse(page.htmlBody, {
      status: 200,
      headers: { 'content-type': 'text/html' },
    });
  }

  return new Response('Missing page id.', { status: 400 });
};

export const runtime = 'edge';
