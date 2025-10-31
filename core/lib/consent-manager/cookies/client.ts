import { z } from 'zod';

import { decode } from '../decoder';
import { encode } from '../encoder';
import { ConsentCookieSchema } from '../schema';

import { CONSENT_COOKIE_NAME, ONE_YEAR_SECONDS } from './constants';

type ConsentCookie = z.infer<typeof ConsentCookieSchema>;

const getCookieValueByName = (name: string) => {
  if (typeof document === 'undefined') return null;

  const pair = document.cookie.split('; ').find((c) => c.startsWith(`${name}=`));

  return pair ? pair.slice(name.length + 1) : null;
};

const serialize = (value: string) =>
  `${CONSENT_COOKIE_NAME}=${value}; Path=/; Max-Age=${ONE_YEAR_SECONDS}; SameSite=Lax; Secure`;

export const getConsentCookie = () => {
  const raw = getCookieValueByName(CONSENT_COOKIE_NAME);

  return raw ? decode(raw) : null;
};

export const setConsentCookie = (consent: ConsentCookie) => {
  if (typeof document === 'undefined') return;
  document.cookie = serialize(encode(consent));
};
