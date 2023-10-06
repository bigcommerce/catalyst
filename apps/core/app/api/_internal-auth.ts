import { NextRequest, NextResponse } from 'next/server';

const token = process.env.BIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN;

if (!token) {
  throw new Error('BIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN is not defined');
}

type Handler = (request: NextRequest) => NextResponse | Promise<NextResponse>;

export const withInternalAuth = (handler: Handler) => {
  return (request: NextRequest) => {
    const requestHeaders = new Headers(request.headers);
    const requestToken = requestHeaders.get('x-internal-token');

    if (requestToken !== token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return handler(request);
  };
};
