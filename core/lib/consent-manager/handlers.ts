import { setConsentAction } from './action';
import { getConsentCookie } from './cookies/client';
import { ConsentStateSchema } from './schema';

const ok = <T>(data: T | null = null) => ({
  data,
  error: null,
  ok: true,
  response: null,
});

export function showConsentBanner(cookieConsentEnabled?: boolean) {
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

  return ok({
    showConsentBanner: cookieConsentEnabled ? show : false,
    ...(cookieConsentEnabled && { jurisdiction: 'NONE' }),
    translations: {
      language,
    },
    branding: 'none',
  });
}

export async function setConsent(options?: { body?: { preferences?: Record<string, boolean> } }) {
  const { preferences } = options?.body ?? {};

  const validatedPreferences = ConsentStateSchema.parse(preferences);

  await setConsentAction(validatedPreferences);

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
