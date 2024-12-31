import { NextRequest } from 'next/server';
import { MiddlewareFactory } from './compose-middlewares';
import { cookies } from 'next/headers';
import { userAgent } from 'next/server';
import { getReferrerID, storeReferrerLog } from '~/belami/lib/fetch-referrer-id';

const BAD_UA_KEYWORDS = ["bot", "agent", "crawl", "spider", "slurp", "rpt-httpclient", "msnptc", "ktxn", "netcraft", "postman", "curl", "python", "go-http-client", "java", "okhttp", "node-fetch", "axios", "http-client", "httpurlconnection", "okhttp"];

export const withReferrerId: MiddlewareFactory = (middleware) => {
  return async (request, event) => {

    // Cookie store works better then request.cookies...
    const cookieStore = await cookies();
    const referrerIdCookie = cookieStore.get('referrerId');

    const sessId = request.nextUrl.searchParams.get('sessid') || 0;
    const refId = referrerIdCookie?.value || request.nextUrl.searchParams.get('rid') || 0;
    const referrer = request.headers.get('referer') || '';
    const logRef = request.nextUrl.searchParams.get('log') || 0;

    const source = request.nextUrl.searchParams.get('utm_source') || '';
    const keywords = request.nextUrl.searchParams.get('keywords') || request.nextUrl.searchParams.get('kw') || '';
    const clickId = request.nextUrl.searchParams.get('glcid') || request.nextUrl.searchParams.get('clickid') || '';

    let log = 1;
    if (Number(logRef) === 0) {
      log = 0;
    }

    const { isBot, browser, device, os } = userAgent(request);
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const ua = request.headers.get('user-agent') || '';

    if (isBot 
      || BAD_UA_KEYWORDS.some(keyword => browser?.name?.toLowerCase().includes(keyword)) 
      || BAD_UA_KEYWORDS.some(keyword => ua.toLowerCase().includes(keyword)) 
      || process.env.LOCAL_IPS?.includes(ip) 
      || process.env.NO_REFERRER_IPS?.includes(ip) 
      || referrer.includes(request.nextUrl.hostname))
      return middleware(request, event); // Skip bots and local IPs and same domain referrers

    const referrerId = log === 1 
      ? Number(refId) == 0 
        ? await getReferrerID(ua, ip, Number(sessId), Number(process.env.SITE_CONFIG_ID ?? 0), log) 
        : Number(refId) 
      : 0;

    if (referrerId && Number.isInteger(referrerId) && referrerId > 0 && log === 1) {
      cookieStore.set('referrerId', referrerId);
      storeReferrerLog(referrerId, source, keywords, clickId, referrer && referrer.length > 0 ? referrer : 'Direct', ip, request.nextUrl.pathname);
    }

    return middleware(request, event);
  };
};