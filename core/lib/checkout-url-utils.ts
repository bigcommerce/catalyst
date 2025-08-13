import { decodeJwt } from 'jose';

interface CheckoutUrlInfo {
  serverIssuedAt: number;
  expiresAt: number;
}

/**
 * Parses a JWT from a checkout URL and extracts timing information
 * @param {string} checkoutUrl The full checkout URL containing the JWT
 * @returns {CheckoutUrlInfo | null} Object with server issued time and expiration, or null if parsing fails
 */
export function getCheckoutUrlInfo(checkoutUrl: string): CheckoutUrlInfo | null {
  try {
    const url = new URL(checkoutUrl);
    const jwt = url.searchParams.get('jwt');

    if (!jwt) {
      return null;
    }

    // Decode the JWT payload using jose (we don't need to verify the signature for this use case)
    const payload = decodeJwt(jwt);

    // We need both iat (server issued time) and eat (server expiration time)
    if (
      payload.iat &&
      typeof payload.iat === 'number' &&
      payload.eat &&
      typeof payload.eat === 'number'
    ) {
      return {
        serverIssuedAt: payload.iat,
        expiresAt: payload.eat,
      };
    }

    return null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error parsing checkout URL expiration:', error);

    return null;
  }
}

/**
 * Checks if a checkout URL is still valid, accounting for clock skew and page load time
 * @param {string | null} checkoutUrl The checkout URL to check
 * @param {number} pageLoadTime When the page was loaded (Date.now() in milliseconds) - used as reference point
 * @param {number} toleranceSeconds Safety buffer in seconds (default: 10)
 * @returns {boolean} true if the URL is still valid, false otherwise
 */
export function isCheckoutUrlValid(
  checkoutUrl: string | null,
  pageLoadTime: number,
  toleranceSeconds = 10,
): boolean {
  if (!checkoutUrl) {
    return false;
  }

  const urlInfo = getCheckoutUrlInfo(checkoutUrl);

  if (!urlInfo) {
    return false;
  }

  // Calculate how much time has elapsed since the server issued the JWT
  const pageLoadTimeSeconds = Math.floor(pageLoadTime / 1000);
  const clientElapsedSinceIssue = pageLoadTimeSeconds - urlInfo.serverIssuedAt;

  // Calculate when the JWT expires relative to when the server issued it
  const serverTtlSeconds = urlInfo.expiresAt - urlInfo.serverIssuedAt;

  // Calculate how much time is left from the server's perspective
  const timeRemainingFromServer = serverTtlSeconds - clientElapsedSinceIssue;

  // Add additional time elapsed since page load
  const now = Math.floor(Date.now() / 1000);
  const timeSincePageLoad = now - pageLoadTimeSeconds;
  const actualTimeRemaining = timeRemainingFromServer - timeSincePageLoad;

  // Consider valid if we have more than the tolerance buffer remaining
  return actualTimeRemaining > toleranceSeconds;
}
