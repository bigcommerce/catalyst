import { NextRequest, NextResponse } from 'next/server';

import { getRawWebPageContent } from '~/client/queries/get-raw-web-page-content';

export const GET = async (request: NextRequest, { params }: { params: { id: string } }) => {
  const { id } = params;

  if (id) {
    const { node } = await getRawWebPageContent(id);

    if (node && 'htmlBody' in node) {
      // todo - support other content types
      return new NextResponse(node.htmlBody, {
        status: 200,
        headers: { 'content-type': 'text/html' },
      });
    }

    return new Response('Page not found.', { status: 404 });
  }

  return new Response('Missing page id.', { status: 400 });
};

export const runtime = 'edge';
