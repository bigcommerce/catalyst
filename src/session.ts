import type { IronSession, IronSessionOptions } from 'iron-session';

import { getIronSession } from "iron-session/edge";
import { NextRequest, NextResponse } from 'next/server';
import { IncomingMessage, ServerResponse } from 'http';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

export const sessionOptions: IronSessionOptions = {
  password: "thisissomekindof32characterlongpassword",
  cookieName: "session-id",
  cookieOptions: {
    secure: false
  },
};

export interface Customer {
  id: number;
}

// This is where we specify the typings of req.session.*
declare module "iron-session" {
  interface IronSessionData {
    customer?: Customer;
    initTimestamp?: number;
    initRequestUrl?: string;
    cartId?: string;
    recentlyViewedProducts?: number[];
  }
}

export async function save(request: NextRequest, res: NextResponse) {
  const session: IronSession = await getIronSession(request, res, sessionOptions);

  await session.save();
}

export async function init(request: NextRequest, res: NextResponse): Promise<NextResponse> {
  const session: IronSession = await getIronSession(request, res, sessionOptions);

  if (session.initTimestamp === undefined) {
    session.initTimestamp = Date.now()
  }

  if (session.initRequestUrl === undefined) {
    session.initRequestUrl = request.url
  }

  if (session.recentlyViewedProducts === undefined) {
    session.recentlyViewedProducts = [];
  }

  const { customer, initTimestamp, initRequestUrl, recentlyViewedProducts } = session;

  console.log("Customer: " + JSON.stringify(customer));
  console.log("initTimestamp: " + initTimestamp);
  console.log("initRequestUrl: " + initRequestUrl);
  console.log("products: " + recentlyViewedProducts);

  await session.save();

  return res;
}

function getPropertyDescriptorForReqSession(
  session: IronSession,
): PropertyDescriptor {
  return {
    enumerable: true,
    get() {
      return session;
    },
    set(value) {
      const keys = Object.keys(value);
      const currentKeys = Object.keys(session);

      currentKeys.forEach((key) => {
        if (!keys.includes(key)) {
          // @ts-ignore See comment in IronSessionData interface
          delete session[key];
        }
      });

      keys.forEach((key) => {
        // @ts-ignore See comment in IronSessionData interface
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

    const session = await getIronSession(
      context.req,
      context.res,
      ironSessionOptions,
    );

    Object.defineProperty(
      context.req,
      "session",
      getPropertyDescriptorForReqSession(session),
    );
    return handler(context);
  };
}