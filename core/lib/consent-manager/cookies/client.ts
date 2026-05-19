import { ConsentCookieSchema } from '../schema';

import { CONSENT_COOKIE_NAME } from './constants';
import { parseCompactFormat } from './parse-compact-format';

const getCookieValueByName = (name: string) => {
  if (typeof document === 'undefined') return null;

  const pair = document.cookie.split('; ').find((c) => c.startsWith(`${name}=`));

  return pair ? pair.slice(name.length + 1) : null;
};

export const getConsentCookie = () => {
  const cookie = getCookieValueByName(CONSENT_COOKIE_NAME);

  if (!cookie) return null;

  const result = ConsentCookieSchema.safeParse(parseCompactFormat(cookie));

  return result.success ? result.data : null;
};
