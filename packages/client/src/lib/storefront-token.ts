const BASE64URL_SEGMENT = /^[A-Za-z0-9_-]+$/;

// Checks JWT shape only: three base64url segments (header.payload.signature)
// whose payload decodes to a JSON object. This does NOT verify that the token
// is actually a valid storefront token (Simple/Private/etc) — we have no way
// to check that client-side without the storefront service's signing key.
// It only rules out tokens that aren't JWTs at all (e.g. opaque OAuth access
// tokens), which is the failure mode this is meant to catch.
export function looksLikeJwt(token: string): boolean {
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
