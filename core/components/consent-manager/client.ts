import { CONSENT_COOKIE_NAME } from './constants';
import { ConsentCookieSchema } from './schema';
import { setC15tConsentCookie } from './server';

/**
 * Gets the value of the consent cookie.
 *
 * @returns {string | null} - The value of the consent cookie.
 */
export function getConsentCookieValue() {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookie = document.cookie.split('; ').find((c) => c.startsWith(`${CONSENT_COOKIE_NAME}=`));

  if (!cookie) {
    return null;
  }

  return cookie.split('=')[1] ?? null;
}

/**
 * Parses the value of the consent cookie.
 *
 * @param {string} cookieValue - The value of the consent cookie.
 * @returns {Object | null} - The parsed consent cookie value.
 */
export function parseConsentCookieValue(cookieValue: string) {
  const decoded = decodeURIComponent(cookieValue);
  const raw: unknown = JSON.parse(decoded);

  const result = ConsentCookieSchema.safeParse(raw);

  if (!result.success) {
    return null;
  }

  return result.data;
}

/**
 * Creates a response context expected by the C15T library.
 *
 * @param {T | null} data - The data to include in the response context.
 * @returns {Object} - The response context.
 */
function createResponseContext<T>(data: T | null = null) {
  return {
    data,
    error: null,
    ok: true,
    response: null,
  };
}

/**
 * Checks if the consent banner should be shown based on the consent cookie.
 *
 * @returns {Object} - The response context.
 */
export function showConsentBanner() {
  let showBanner = true;

  try {
    const consentData = getConsentCookieValue();
    const parsedConsentData = consentData ? parseConsentCookieValue(consentData) : null;

    showBanner = !parsedConsentData;
  } catch {
    showBanner = false;
  }

  return createResponseContext({
    showConsentBanner: showBanner,
    branding: 'none',
  });
}

/**
 * Sets the consent for the user.
 *
 * @param {Object} options - The options for setting the consent.
 * @returns {Object} - The response context.
 */
export async function setConsent(options?: {
  body?: { preferences?: Record<string, boolean>; type?: string; domain?: string };
}) {
  const { preferences } = options?.body ?? {};

  await setC15tConsentCookie({
    preferences: preferences ?? {},
    timestamp: new Date(),
  });

  return createResponseContext();
}

/**
 * Verifies the consent for the user.
 *
 * @returns {Object} - The response context.
 */
export function verifyConsent() {
  return createResponseContext();
}
