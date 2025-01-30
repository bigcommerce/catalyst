import { MiddlewareFactory } from './compose-middlewares';
import { cookies } from 'next/headers';

export const withPriceMax: MiddlewareFactory = (middleware) => {
  return async (request, event) => {

    // Cookie store works better then request.cookies...
    const cookieStore = await cookies();
    //const dCookie = cookieStore.get('d');
    //const sourceCookie = cookieStore.get('source');
    //const pmxCookie = cookieStore.get('pmx');

    const d = request.nextUrl.searchParams.get('d') || undefined;
    const source = request.nextUrl.searchParams.get('source') || undefined;

    /*
    if (d && d !== dCookie?.value)
      cookieStore.set('d', d, { maxAge: 86400 });

    if (source && source !== sourceCookie?.value)
      cookieStore.set('source', source, { maxAge: 86400 });
    */

    if (d || source) {
      cookieStore.set('pmx', btoa(JSON.stringify({
        d: d,
        source: source
      })), { maxAge: 86400 });
    }

    return middleware(request, event);
  };
};