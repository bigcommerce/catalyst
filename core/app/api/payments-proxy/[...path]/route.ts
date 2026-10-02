import { type NextRequest } from 'next/server';

// Same-origin proxy for the account-payments microapp's direct-to-BigPay calls (the stored_instruments POST, and any
// other calls it makes to `paymentsUrl`). It forwards server-to-server to the payments host, preserving the request
// body and the Authorization (VAT) header, so the browser only ever makes a first-party request. This removes the CORS
// problem and keeps the VAT off any third-party origin. See PROJECT-6074-STRIPE-PLAN.md (doc 11.4).
const PAYMENTS_HOST = process.env.PAYMENTS_HOST ?? '';

async function forward(request: NextRequest, path: string[]): Promise<Response> {
  if (!PAYMENTS_HOST) {
    return new Response('PAYMENTS_HOST is not configured', { status: 500 });
  }

  const { search } = new URL(request.url);
  const target = `${PAYMENTS_HOST}/${path.join('/')}${search}`;

  const headers = new Headers(request.headers);
  headers.delete('host');

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';

  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body: hasBody ? await request.text() : undefined,
    redirect: 'manual',
  });

  // Strip hop-by-hop / length headers that don't survive re-streaming.
  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete('content-encoding');
  responseHeaders.delete('content-length');
  responseHeaders.delete('transfer-encoding');

  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
}

interface RouteContext {
  params: Promise<{ path: string[] }>;
}

export async function GET(request: NextRequest, { params }: RouteContext): Promise<Response> {
  return forward(request, (await params).path);
}

export async function POST(request: NextRequest, { params }: RouteContext): Promise<Response> {
  return forward(request, (await params).path);
}

export async function PATCH(request: NextRequest, { params }: RouteContext): Promise<Response> {
  return forward(request, (await params).path);
}

export async function DELETE(request: NextRequest, { params }: RouteContext): Promise<Response> {
  return forward(request, (await params).path);
}
