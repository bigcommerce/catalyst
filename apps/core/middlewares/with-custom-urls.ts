import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { getRoute } from '~/client/queries/getRoute';

import { defaultLocale, localePrefix, LocalePrefixes } from '../i18n';
import { kv } from '../lib/kv';

import { type MiddlewareFactory } from './compose-middlewares';

type Node = Awaited<ReturnType<typeof getRoute>>;

const clearPathFromLocale = (path: string) => {
  const selectedLocale = cookies().get('NEXT_LOCALE')?.value;
  let res: string;

  if (localePrefix === LocalePrefixes.ALWAYS) {
    res = selectedLocale ? `/${path.split('/').slice(2).join('/')}` : path;

    return res;
  }

  if (localePrefix === LocalePrefixes.ASNEEDED) {
    res =
      selectedLocale && selectedLocale !== defaultLocale
        ? `/${path.split('/').slice(2).join('/')}`
        : path;

    return res;
  }

  return path;
};

const createRewriteUrl = (path: string, request: NextRequest) => {
  const url = new URL(path, request.url);

  url.search = request.nextUrl.search;

  return url;
};

const getExistingRoute = async (request: NextRequest) => {
  try {
    const route = await kv.get<{ node: Node }>(clearPathFromLocale(request.nextUrl.pathname));

    return route?.node;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};

const setKvRoute = async (request: NextRequest, node: Node) => {
  try {
    await kv.set(
      clearPathFromLocale(request.nextUrl.pathname),
      { node },
      {
        ex: 60 * 30, // 30 minutes
      },
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};

const getCustomUrlNode = async (request: NextRequest) => {
  try {
    const route = await getExistingRoute(request);

    if (route !== undefined) {
      return route;
    }

    const node = await getRoute(clearPathFromLocale(request.nextUrl.pathname));

    if (node !== undefined) {
      await setKvRoute(request, node);
    }

    return node;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};

export const withCustomUrls: MiddlewareFactory = (next) => {
  return async (request, event) => {
    const locale = cookies().get('NEXT_LOCALE')?.value;
    const currentLocale = locale ? `/${locale}` : '';

    const node = await getCustomUrlNode(request);

    switch (node?.__typename) {
      case 'Brand': {
        const url = createRewriteUrl(`${currentLocale}/brand/${node.entityId}`, request);

        return NextResponse.rewrite(url);
      }

      case 'Category': {
        const url = createRewriteUrl(`${currentLocale}/category/${node.entityId}`, request);

        return NextResponse.rewrite(url);
      }

      case 'Product': {
        const url = createRewriteUrl(`${currentLocale}/product/${node.entityId}`, request);

        return NextResponse.rewrite(url);
      }

      default:
        return next(request, event);
    }
  };
};
