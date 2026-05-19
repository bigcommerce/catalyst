import { cookies } from 'next/headers';

import { ConsentCookieSchema } from '../schema';

import { CONSENT_COOKIE_NAME } from './constants';
import { parseCompactFormat } from './parse-compact-format';

export const getConsentCookie = async () => {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(CONSENT_COOKIE_NAME)?.value;

  if (!cookie) return null;

  const result = ConsentCookieSchema.safeParse(parseCompactFormat(cookie));

  return result.success ? result.data : null;
};
