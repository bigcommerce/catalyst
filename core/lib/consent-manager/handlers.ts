import { getConsentCookie, setConsentCookie } from './cookies/client';

const ok = <T>(data: T | null = null) => ({
  data,
  error: null,
  ok: true,
  response: null,
});

export function showConsentBanner(isCookieConsentEnabled: boolean) {
  let show = true;
  let language = 'en';

  if (typeof document !== 'undefined') {
    language = document.documentElement.lang;
  }

  try {
    const consent = getConsentCookie();

    show = !consent;
  } catch {
    show = false;
  }

  if (!isCookieConsentEnabled) {
    return ok({
      showConsentBanner: false,
      jurisdiction: { code: 'NONE' },
      translations: {
        language,
      },
      branding: 'none',
    });
  }

  return ok({
    showConsentBanner: show,
    translations: {
      language,
    },
    branding: 'none',
  });
}

export function setConsent(options?: { body?: { preferences?: Record<string, boolean> } }) {
  const { preferences } = options?.body ?? {};

  setConsentCookie({
    preferences: preferences ?? {},
    timestamp: new Date().toISOString(),
  });

  return ok();
}

export function verifyConsent() {
  const consent = getConsentCookie();

  if (!consent) {
    return ok({
      isValid: false,
    });
  }

  return ok({
    isValid: true,
  });
}
