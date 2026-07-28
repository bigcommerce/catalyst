import { cookies } from 'next/headers';
import { z } from 'zod';

import { decode } from '../decoder';
import { encode } from '../encoder';
import { ConsentCookieSchema } from '../schema';

import { CONSENT_COOKIE_NAME, ONE_YEAR_SECONDS } from './constants';

type ConsentCookie = z.infer<typeof ConsentCookieSchema>;

export const getConsentCookie = async () => {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(CONSENT_COOKIE_NAME)?.value;

  if (!cookie) return null;

  return decode(cookie);
};

export const setConsentCookie = async (consent: ConsentCookie) => {
  const cookieStore = await cookies();

  cookieStore.set({
    name: CONSENT_COOKIE_NAME,
    value: encode(consent),
    path: '/',
    maxAge: ONE_YEAR_SECONDS,
    sameSite: 'lax',
    secure: true,
  });
};
