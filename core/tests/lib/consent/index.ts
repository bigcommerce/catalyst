import { testEnv } from '~/tests/environment';

type ConsentCategory = 'functionality' | 'marketing' | 'measurement';

// Mirrors CONSENT_COOKIE_NAME; tests don't import from ~/lib.
const CONSENT_COOKIE_NAME = 'c15t-consent';

// c15t's compact format: `necessary` is always granted and only granted optional
// categories are present, so no categories means everything optional was declined.
export const consentCookie = (granted: ConsentCategory[] = []) => ({
  name: CONSENT_COOKIE_NAME,
  value: [`i.t:${Date.now()}`, 'c.necessary:1', ...granted.map((c) => `c.${c}:1`)].join(','),
  url: testEnv.PLAYWRIGHT_TEST_BASE_URL,
});
