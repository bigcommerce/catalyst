import { NextRequest, NextResponse } from 'next/server';
import { userAgent } from 'next/server';
import { cookies } from 'next/headers';
import { getReferrerID, storeReferrerLog } from '~/belami/lib/fetch-referrer-id';
import { isBadUserAgent } from '~/belami/lib/bot-detection';

export const POST = async (request: NextRequest) => {

  const cookieStore = await cookies();

  const body = await request.json();

  const { isBot, browser, device, os } = userAgent(request);
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

  if (isBot 
    || await isBadUserAgent(browser?.name ?? '') === true
    || await isBadUserAgent(body?.ua ?? '') === true
    || process.env.LOCAL_IPS?.includes(ip) 
    || process.env.LOCAL_IPS?.includes(body?.ip) 
    || process.env.NO_REFERRER_IPS?.includes(ip) 
    || process.env.NO_REFERRER_IPS?.includes(body?.ip) 
    || body?.referrer.includes(request.nextUrl.hostname)
  )
    return NextResponse.json({
      status: 'Error',
      message: 'Bad Request',
    }, {
      status: 400
    });

  const referrerId = Number(body?.rid) == 0 
    ? await getReferrerID(body?.ua, body?.ip, Number(body?.sessid), Number(body?.sid), 1) 
    : Number(body?.rid);

  console.log(`Referrer ID: ${referrerId}`);

  if (referrerId && Number.isInteger(referrerId) && referrerId > 0) {
    cookieStore.set('referrerId', referrerId);
    await storeReferrerLog(referrerId, body?.source, body?.keywords, body?.cid, body?.referrer && body?.referrer.length > 0 ? body?.referrer : 'Direct', body?.ip, body?.page);
  }

  return NextResponse.json({
    status: 'OK',
    message: 'Referrer ID processed successfully!',
    data: referrerId
  }, {
    status: 200
  });
};

export const runtime = 'nodejs';