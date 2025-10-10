'use server';

import { cookies } from 'next/headers';

const COOKIE_NAME = 'c15t-consent';

type AllConsentNames = 'experience' | 'functionality' | 'marketing' | 'measurement' | 'necessary';

type ConsentState = Partial<Record<AllConsentNames, boolean>>;

interface SetC15tConsentCookie {
  preferences: ConsentState;
  timestamp: Date;
}

export async function setC15tConsentCookie(consent: SetC15tConsentCookie) {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, JSON.stringify(consent), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  return { ok: true };
}

/**
 * @todo should we just use core/lib/client-cookies.ts?
 */
