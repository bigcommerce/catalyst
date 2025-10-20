'use server';

import { cookies } from 'next/headers';
import { z } from 'zod';

import { CONSENT_COOKIE_NAME } from './constants';
import { ConsentCookieSchema } from './schema';

type SetConsentCookie = z.infer<typeof ConsentCookieSchema>;

export async function setC15tConsentCookie(consent: SetConsentCookie) {
  const cookieStore = await cookies();

  cookieStore.set(CONSENT_COOKIE_NAME, JSON.stringify(consent), {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  return { ok: true };
}

export async function getC15tConsentCookie() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(CONSENT_COOKIE_NAME);

  if (!cookie) {
    return null;
  }

  const result = ConsentCookieSchema.safeParse(cookie.value);

  if (!result.success) {
    return null;
  }

  return result.data;
}
