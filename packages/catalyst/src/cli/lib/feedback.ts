import { assertAuthorized } from './auth-errors';
import { httpError } from './http-errors';
import { getTelemetry } from './telemetry';

// Field limits enforced by the Feedback service (makeswift-gateway-global).
// Lengths are counted in characters. We check them before the request so the
// user gets a clear message instead of a 400.
export const MAX_TITLE_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 5000;
export const MAX_DIAGNOSTICS_BODY_LENGTH = 100_000;

export type FeedbackField = 'Title' | 'Description';

export interface DiagnosticsSection {
  title: string;
  body: string;
}

export interface FeedbackInput {
  title: string;
  description: string;
  diagnostics: DiagnosticsSection[];
}

interface SubmitFeedbackOptions {
  // Identifies where the feedback came from in the filed issue.
  source?: string;
  signal?: AbortSignal;
}

// Returns an error message when the value is blank or too long.
export function validateFeedbackField(field: FeedbackField, value: string): string | undefined {
  const maxLength = field === 'Title' ? MAX_TITLE_LENGTH : MAX_DESCRIPTION_LENGTH;
  // Characters, not UTF-16 code units, the same as the server.
  const length = Array.from(value.trim()).length;

  if (length === 0) {
    return `${field} is required.`;
  }

  if (length > maxLength) {
    return `${field} must be at most ${maxLength} characters (got ${length}).`;
  }

  return undefined;
}

// POST /stores/{storeHash}/v3/feedback (api-proxy). The proxy forwards it to
// the Feedback gRPC service, which files a Linear issue. Returns 204.
export async function submitFeedback(
  feedback: FeedbackInput,
  storeHash: string,
  accessToken: string,
  apiHost: string,
  { source = 'catalyst-cli', signal }: SubmitFeedbackOptions = {},
): Promise<void> {
  const response = await fetch(`https://${apiHost}/stores/${storeHash}/v3/feedback`, {
    method: 'POST',
    signal,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Auth-Token': accessToken,
      'X-Correlation-Id': getTelemetry().correlationId,
    },
    body: JSON.stringify({ ...feedback, source }),
  });

  assertAuthorized(response);

  if (!response.ok) {
    throw await httpError(response, 'Failed to submit feedback');
  }
}
