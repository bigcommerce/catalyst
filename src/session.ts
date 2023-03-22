import type { IronSessionOptions } from 'iron-session';
import { getIronSession } from 'iron-session/edge';
import { NextRequest, NextResponse } from 'next/server';

export const sessionOptions: IronSessionOptions = {
  password: 'thisissomekindof32characterlongpassword',
  cookieName: 'session-id',
  cookieOptions: {
    secure: false,
  },
};

export interface Customer {
  id: number;
}

// This is where we specify the typings of req.session.*
declare module 'iron-session' {
  interface IronSessionData {
    customer?: Customer;
    cartId?: string;
    initTimestamp: number;
    initRequestUrl: string;
    recentlyViewedProducts: number[];
  }
}

export async function sessionMiddleware(request: NextRequest) {
  const response = NextResponse.next();
  const session = await getIronSession(request, response, sessionOptions);

  const sessionCookie = request.cookies.get(process.env.SESSION_ID ?? '');

  // NextRequest RequestCookie doesnt contain expiry so we must get it from the response
  const sessionExpiry = response.cookies.get(process.env.SESSION_ID ?? '')?.expires;

  // initialize new session
  if (sessionCookie === undefined) {
    session.initTimestamp = Date.now();
    session.initRequestUrl = request.nextUrl.pathname;
    session.recentlyViewedProducts = [];

    await session.save();
  } else if (sessionExpiry !== undefined) {
    // if we have a valid session and expiry, and it expires in less than 1 day, update TTL
    const now = new Date().getTime();
    const expiry = sessionExpiry.getTime();

    // 1 day in MS
    if (expiry - now < 86400000) {
      await session.save();
    }
  }

  return {
    request,
    response,
  };
}
