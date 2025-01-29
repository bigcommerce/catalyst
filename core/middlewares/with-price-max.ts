import { NextRequest } from 'next/server';
import { MiddlewareFactory } from './compose-middlewares';
import { cookies } from 'next/headers';
import { userAgent } from 'next/server';

export const withPriceMax: MiddlewareFactory = (middleware) => {
  return async (request, event) => {

    // Cookie store works better then request.cookies...
    const cookieStore = await cookies();
    const dCookie = cookieStore.get('d');
    const sourceCookie = cookieStore.get('source');

    const d = request.nextUrl.searchParams.get('d');
    const source = request.nextUrl.searchParams.get('source');

    if (d && d !== dCookie?.value)
      cookieStore.set('d', d);


    if (source && source !== sourceCookie?.value)
      cookieStore.set('source', source);

    return middleware(request, event);
  };
};