import { headers } from 'next/headers';
import 'server-only';

// eslint-disable-next-line valid-jsdoc
/**
 * Bypasses reCaptcha for automated tests.
 *
 * Returns the reCaptcha settings if the test is not running.
 */
export const bypassReCaptcha = async <T>(reCaptchaSettings: T) => {
  const vercelBypassKey = (await headers()).get('X-Vercel-Protection-Bypass');
  const vercelSetBypassCookie = (await headers()).get('X-Vercel-Set-Bypass-Cookie');

  const shouldBypassreCaptcha = vercelBypassKey && vercelSetBypassCookie === 'true';

  if (shouldBypassreCaptcha) {
    return;
  }

  return reCaptchaSettings;
};
