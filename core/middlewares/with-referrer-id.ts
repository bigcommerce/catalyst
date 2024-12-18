import { NextRequest } from 'next/server';
import { MiddlewareFactory } from './compose-middlewares';
import { cookies } from 'next/headers';

export const withReferrerId: MiddlewareFactory = (middleware) => {
  return async (request, event) => {

    // Cookie store works better then request.cookies...
    const cookieStore = await cookies();
    const referrerIdCookie = cookieStore.get('referrerId');

    // If referrerId exists then return...
    if (referrerIdCookie && referrerIdCookie.value)
      return middleware(request, event);

    const trigger = request.nextUrl.searchParams.get('t') || null;

    // If no trigger then return...
    if (!trigger)
      return middleware(request, event);

    // Set new referrerId...
    cookieStore.set('referrerId', '1234567890');

    return middleware(request, event);
  };
};
