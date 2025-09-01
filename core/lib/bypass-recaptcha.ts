import { headers } from 'next/headers';
import 'server-only';

// eslint-disable-next-line valid-jsdoc
/**
 * Bypasses reCaptcha for automated tests.
 *
 * Returns the reCaptcha settings if the test is not running.
 */
export const bypassReCaptcha = async <T>(reCaptchaSettings: T) => {
  const BypassKey = (await headers()).get('X--Protection-Bypass');
  const SetBypassCookie = (await headers()).get('X--Set-Bypass-Cookie');

  const shouldBypassreCaptcha = BypassKey && SetBypassCookie === 'true';

  if (shouldBypassreCaptcha) {
    return;
  }

  return reCaptchaSettings;
};
