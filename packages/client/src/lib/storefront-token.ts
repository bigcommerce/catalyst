const BASE64URL_SEGMENT = /^[A-Za-z0-9_-]+$/;

// A BigCommerce storefront token is a JWT: three base64url segments
// (header.payload.signature) whose payload decodes to a JSON object. Other
// token types (e.g. OAuth access tokens) are opaque strings that do not match
// this shape, so this lets us distinguish "wrong kind of token" from other
// causes of a 401.
export function isWellFormedStorefrontToken(token: string): boolean {
  const segments = token.split('.');

  if (segments.length !== 3 || !segments.every((segment) => BASE64URL_SEGMENT.test(segment))) {
    return false;
  }

  try {
    const payload = segments[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(payload)) as unknown;

    return typeof decoded === 'object' && decoded !== null;
  } catch {
    return false;
  }
}
