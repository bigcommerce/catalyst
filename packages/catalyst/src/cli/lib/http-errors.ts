import { z } from 'zod';

import { UserActionableError } from './errors';

// BigCommerce APIs surface errors as an RFC-7807-ish envelope:
// `{ title, detail, errors: { <field>: <message> } }`. We prefer the server's
// own prose over anything we could invent, so callers show the API's reason
// verbatim when it's available.
const apiErrorBodySchema = z.object({
  title: z.string().optional(),
  detail: z.string().optional(),
  errors: z.record(z.string(), z.string()).optional(),
});

// Curated copy for when the response has no usable body. Keyed by status class,
// not exact code, so any 4xx/5xx we don't specifically handle still reads well.
const FALLBACK_CLIENT_ERROR =
  'The request was rejected. Check your input — your access token may be missing a required scope, or the resource may not exist.';
const FALLBACK_SERVER_ERROR =
  'Something went wrong on our end. Please try again. If the issue persists, contact support.';

// Pulls a human-readable message out of a parsed API error body, preferring the
// most specific prose the server gave us: its `detail`, then `title`, enriched
// with any field-level `errors`. Returns undefined when the body doesn't match
// the envelope (empty, HTML, plain text, or already-consumed).
export function extractApiErrorMessage(body: unknown): string | undefined {
  const parsed = apiErrorBodySchema.safeParse(body);

  if (!parsed.success) return undefined;

  const { title, detail, errors } = parsed.data;
  const fieldErrors =
    errors && Object.keys(errors).length > 0
      ? Object.entries(errors)
          .map(([field, message]) => `${field}: ${message}`)
          .join('; ')
      : undefined;

  const headline = detail ?? title;

  if (headline && fieldErrors) return `${headline} (${fieldErrors})`;

  return headline ?? fieldErrors;
}

// Turns a non-OK `Response` into a readable error to throw. Reads the body once
// (safely — a malformed or empty body never throws) and prefers the API's own
// message; otherwise it falls back to curated copy for the status class.
//
// The 4xx/5xx split decides the *type*, which the top-level handler in
// `index.ts` keys off: a 4xx is a clear, user-actionable response, so it throws
// `UserActionableError` and the handler drops the "share your Correlation ID
// with support" bug-report framing; a 5xx is a server-side failure worth
// escalating, so it stays a plain `Error` and keeps that framing.
//
// Returns the error rather than throwing so call sites read
// `throw await httpError(response, 'Failed to fetch projects')` and TypeScript
// still sees the throw for control-flow narrowing.
export async function httpError(response: Response, action: string): Promise<Error> {
  const body: unknown = await response.json().catch(() => null);
  const isServerError = response.status >= 500;
  const detail =
    extractApiErrorMessage(body) ?? (isServerError ? FALLBACK_SERVER_ERROR : FALLBACK_CLIENT_ERROR);
  const message = `${action}: ${detail}`;

  return isServerError ? new Error(message) : new UserActionableError(message);
}
