import { NextRequest } from 'next/server';
import { MiddlewareFactory } from './compose-middlewares';
import { cookies } from 'next/headers';
import { userAgent } from 'next/server';

export const withReferrerId: MiddlewareFactory = (middleware) => {
  return async (request, event) => {

    // Cookie store works better then request.cookies...
    const cookieStore = await cookies();
    const referrerIdCookie = cookieStore.get('referrerId');

    // If referrerId exists then return...
    // if (referrerIdCookie && referrerIdCookie.value)
    //   return middleware(request, event);

    const trigger = request.nextUrl.searchParams.get('t') || null;

    // If no trigger then return...
    if (!trigger)
      return middleware(request, event);

    const { isBot, browser, device, os } = userAgent(request);

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const ua = request.headers.get('user-agent') || '';

    const referrerId = await getReferrerID(ua, ip);

    if (referrerId && Number.isInteger(referrerId)) {
      cookieStore.set('referrerId', referrerId);
      storeReferrerLog(referrerId, '', '', '', request.headers.get('referer') || '', ip, request.nextUrl.pathname);
    }

    return middleware(request, event);
  };
};

const getReferrerID = async (ua: string, ip: string, sid: number = 0, scid: number = 0, log: number = 1) => {
  const response = await fetch(`https://as-nc-inf-referrerid-live.azurewebsites.net/referrerid`, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      "UserHostAddress": ip,
      "UserAgent": ua,
      "SessionID": sid,
      "SiteConfigID": scid,
      "LogRecord": log
    }),
    cache: 'no-cache',
    //next: { revalidate: 3600 }
  });

  const data = await response.json();

  return data?.isSuccess ? data.data : null;
};

const storeReferrerLog = async (referrerID: number, source: string, keywords: string, cid: string, referrer: string, ip: string, page: string) => {
  const response = await fetch(`https://as-nc-inf-referrerid-live.azurewebsites.net/referrerlog`, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      "ReferrerID": referrerID,
      "SearchSource": source,
      "SearchKW": keywords,
      "ClickID": cid,
      "ClientReferrer": referrer,
      "IPLog": ip,
      "LandingPage": page,
      "CategoryTypeID": 0,
      "CategoryID": 0,
      "SubCategoryID": 0,
      "MfgID": 0,
      "ProductID": 0,
      "InTest": 0,
      "LogType": 0
    }),
    cache: 'no-cache',
    //next: { revalidate: 3600 }
  });

  const data = await response.json();

  return data?.isSuccess ? data.data : null;
};