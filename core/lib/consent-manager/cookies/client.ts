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

  try {
    const consent = parseCompactFormat(cookie);

    return ConsentCookieSchema.parse(consent);
  } catch {
    return null;
  }
};
