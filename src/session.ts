import type { IronSession, IronSessionOptions } from 'iron-session';
import { getIronSession } from 'iron-session/edge';
import { NextRequest, NextResponse } from 'next/server';

export const sessionOptions: IronSessionOptions = {
  password: process.env.SESSION_PASSWORD ?? '',
  cookieName: process.env.SESSION_ID ?? '',
  ttl: parseInt(process.env.SESSION_TTL ?? '0', 10),
  cookieOptions: {
    secure: true, // this will eventually change based off if sitewide https is enabled or not
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
    expiry: number;
  }
}

// TTL for session in milliseconds
function ttlForSession(now: number): number {
  return now + parseInt(process.env.SESSION_TTL ?? '0', 10) * 1000;
}

async function generateNewSession(
  session: IronSession,
  now: number,
  requestUrl: string,
): Promise<void> {
  session.initTimestamp = Date.now();
  session.initRequestUrl = requestUrl;
  session.recentlyViewedProducts = [];
  session.expiry = ttlForSession(now);

  await session.save();
}

export async function sessionMiddleware(request: NextRequest) {
  const now = new Date().getTime();
  const response = NextResponse.next();
  const session = await getIronSession(request, response, sessionOptions);

  const sessionCookie = request.cookies.get(process.env.SESSION_ID ?? '');

  // initialize new session
  if (sessionCookie === undefined) {
    await generateNewSession(session, now, request.nextUrl.pathname);
  } else if (session.expiry - now < 86400000 && session.expiry - now > 0) {
    // if we have a valid session and expiry, and it expires in less than 1 day, update TTL
    session.expiry = ttlForSession(now);
    await session.save();
  } else if (session.expiry - now <= 0){
    // If we have a valid session cookie, but the internal session ttl has expired, destroy it and generate a new one
    session.destroy();

    await generateNewSession(session, now, request.nextUrl.pathname);
  }

  return {
    request,
    response,
  };
}
