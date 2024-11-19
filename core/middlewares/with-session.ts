import { type NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

import { type MiddlewareFactory } from './compose-middlewares';

const VISIT_COOKIE_NAME = 'bc_visit_id';
const VISITOR_COOKIE_NAME = 'bc_visitor_id';

const VISIT_EXPIRY = 30 * 60; // 30 minutes in seconds
const VISITOR_EXPIRY = 365 * 24 * 60 * 60; // 1 year in seconds

function getCookieExpiry(seconds: number): Date {
  return new Date(Date.now() + seconds * 1000);
}

export const withSession: MiddlewareFactory = (next) => {
  return async (request: NextRequest, event) => {
    const response = await next(request, event);
    
    // Get existing cookies
    const visitId = request.cookies.get(VISIT_COOKIE_NAME)?.value;
    const visitorId = request.cookies.get(VISITOR_COOKIE_NAME)?.value;
    
    // Clone the response so we can modify headers
    const newResponse = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    // Set or refresh the visit ID cookie
    newResponse.cookies.set({
      name: VISIT_COOKIE_NAME,
      value: visitId || uuidv4(),
      expires: getCookieExpiry(VISIT_EXPIRY),
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    // Set or refresh the visitor ID cookie
    newResponse.cookies.set({
      name: VISITOR_COOKIE_NAME,
      value: visitorId || uuidv4(),
      expires: getCookieExpiry(VISITOR_EXPIRY),
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    // Copy all headers from the original response
    response.headers.forEach((value, key) => {
      newResponse.headers.set(key, value);
    });

    return newResponse;
  };
};
