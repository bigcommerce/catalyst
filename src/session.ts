import { IncomingMessage, ServerResponse } from 'http';
import type { IronSession, IronSessionOptions } from 'iron-session';
import { getIronSession } from 'iron-session/edge';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
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

type PartialIronSessionData = Pick<IronSession, 'save' | 'destroy'> &
  Partial<Omit<IronSession, 'save' | 'destroy'>>;

export async function initializeSession(
  request: NextRequest,
  response: NextResponse,
): Promise<NextResponse> {
  const session: PartialIronSessionData = await getIronSession(request, response, sessionOptions);

  session.initTimestamp = session.initTimestamp ?? Date.now();
  session.initRequestUrl = session.initRequestUrl ?? request.nextUrl.pathname;
  session.recentlyViewedProducts = session.recentlyViewedProducts ?? [];

  console.log(JSON.stringify(session, null, 2));

  await session.save();

  return response;
}

function getPropertyDescriptorForReqSession(session: IronSession): PropertyDescriptor {
  return {
    enumerable: true,
    get() {
      return session;
    },
    set(value: Record<string, unknown>) {
      const keys = Object.keys(value);
      const currentKeys = Object.keys(session);

      currentKeys.forEach((key) => {
        if (!keys.includes(key)) {
          // @ts-expect-error See comment in IronSessionData interface
          delete session[key];
        }
      });

      keys.forEach((key) => {
        // @ts-expect-error See comment in IronSessionData interface
        session[key] = value[key];
      });
    },
  };
}

type GetIronSessionSSROptions = (
  request: IncomingMessage,
  response: ServerResponse,
) => Promise<IronSessionOptions> | IronSessionOptions;

export function withIronSessionSsr<
  P extends { [key: string]: unknown } = { [key: string]: unknown },
>(
  handler: (
    context: GetServerSidePropsContext,
  ) => GetServerSidePropsResult<P> | Promise<GetServerSidePropsResult<P>>,
  options: IronSessionOptions | GetIronSessionSSROptions,
) {
  return async function nextGetServerSidePropsHandlerWrappedWithIronSession(
    context: GetServerSidePropsContext,
  ) {
    let ironSessionOptions: IronSessionOptions;

    // If options is a function, call it and assign the results back.
    if (options instanceof Function) {
      ironSessionOptions = await options(context.req, context.res);
    } else {
      ironSessionOptions = options;
    }

    const session = await getIronSession(context.req, context.res, ironSessionOptions);

    Object.defineProperty(context.req, 'session', getPropertyDescriptorForReqSession(session));

    return handler(context);
  };
}
