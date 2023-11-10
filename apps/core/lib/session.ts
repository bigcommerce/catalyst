import { FetcherRequestInit } from '@bigcommerce/catalyst-client';
import { IronSessionData, unsealData } from 'iron-session/edge';
import { cookies } from 'next/headers';
import 'server-only';

declare module 'iron-session' {
  interface IronSessionData {
    customer?: {
      id: number;
    };
  }
}

const cookieName = process.env.IRON_SESSION_COOKIE_NAME;
const password = process.env.IRON_SESSION_PASSWORD;

if (!cookieName) {
  throw new Error('IRON_SESSION_COOKIE_NAME is not defined');
}

if (!password) {
  throw new Error('IRON_SESSION_PASSWORD is not defined');
}

export const sessionOptions = {
  cookieName,
  password,
  ttl: 60 * 60, // 1 hour
};

export const getSessionFetchConfig = async (): Promise<FetcherRequestInit | undefined> => {
  const encryptedSession = cookies().get(cookieName)?.value;
  const session = encryptedSession
    ? await unsealData<IronSessionData>(encryptedSession, { password })
    : null;

  if (session?.customer) {
    return {
      headers: {
        'x-bc-customer-id': session.customer.id.toString(),
      },
      cache: null,
      next: {
        revalidate: 10, // 10 seconds
      },
    };
  }
};
