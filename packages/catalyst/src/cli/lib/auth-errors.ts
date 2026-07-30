import { UserActionableError } from './errors';

// Thrown when an authenticated API call comes back 401 Unauthorized — i.e. the
// access token was sent but rejected. This covers an expired/revoked token as
// well as a token that was never valid (e.g. a typo'd `--access-token` flag or
// a stale `CATALYST_ACCESS_TOKEN` env var). It does NOT cover the "no
// credentials at all" case — that's caught earlier by `resolveCredentials`
// (and `auth whoami`'s own guard) before any request is made.
//
// The CLI can't refresh the token silently (the device-code flow returns no
// refresh token), so the only recovery is to re-authenticate. Callers should
// let this propagate to the top-level handler in `index.ts`, which prints the
// message without the generic "share your Correlation ID with support"
// bug-report framing.
export class UnauthorizedError extends UserActionableError {
  constructor() {
    super(
      'Your access token is invalid or has expired.\n' +
        'Run `catalyst auth login` to re-authenticate.',
    );
    this.name = 'UnauthorizedError';
  }
}

// Call immediately after an authenticated `fetch`, before any other status
// checks. Only 401 means "invalid/expired token" — 403 is overloaded elsewhere
// to mean "API not enabled" (scope/feature flag), so it is intentionally not
// treated as an auth failure here.
export function assertAuthorized(response: Response): void {
  if (response.status === 401) {
    throw new UnauthorizedError();
  }
}
