// Base class for errors that are the user's to fix and whose message already
// says everything they need (bad input, a naming/ownership conflict, invalid
// credentials, a feature that isn't enabled). The top-level handler in
// `index.ts` prints these plainly and exits non-zero WITHOUT the "share your
// Correlation ID with BigCommerce support" bug-report framing that unexpected
// and server-side errors get — a clear 4xx response is not a bug to report.
export class UserActionableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserActionableError';
  }
}
