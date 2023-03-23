import type { IronSession, IronSessionOptions } from 'iron-session';
import { NextRequest } from 'next/server';

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
  }
}

type PartialIronSessionData = Pick<IronSession, 'save' | 'destroy'> &
  Partial<Omit<IronSession, 'save' | 'destroy'>>;

export async function cartCreated(session: PartialIronSessionData, cartId: string): Promise<void> {
  session.cartId = cartId;
  await session.save();
}

export async function productViewed(
  session: PartialIronSessionData,
  productId: number,
): Promise<void> {
  if (!session.recentlyViewedProducts?.includes(productId)) {
    session.recentlyViewedProducts?.push(productId);
  }

  await session.save();
}

export async function handleSession(
  request: NextRequest,
  session: PartialIronSessionData,
): Promise<void> {
  const sessionCookie = request.cookies.get(process.env.SESSION_ID ?? '');

  // initialize new session
  if (sessionCookie === undefined) {
    session.initTimestamp = session.initTimestamp ?? Date.now();
    session.initRequestUrl = session.initRequestUrl ?? request.nextUrl.pathname;
    session.recentlyViewedProducts = session.recentlyViewedProducts ?? [];
  }

  console.log(JSON.stringify(session, null, 2));

  await session.save();
}
