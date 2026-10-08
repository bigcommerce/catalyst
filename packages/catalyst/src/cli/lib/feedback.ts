import { assertAuthorized } from './auth-errors';
import { httpError } from './http-errors';
import { getTelemetry } from './telemetry';

// Identifies the CLI as the feedback source in the filed issue.
export const FEEDBACK_SOURCE = 'catalyst-cli';

// Field limits enforced by the Feedback service (makeswift-gateway-global).
// Lengths are counted in characters. We check them before the request so the
// user gets a clear message instead of a 400.
export const MAX_TITLE_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 5000;
export const MAX_DIAGNOSTICS_BODY_LENGTH = 100_000;

// For prompts that send in the background of another command (the survey, the
// error report): do not hold up the terminal for a slow endpoint.
export const FEEDBACK_SUBMIT_TIMEOUT_MS = 5000;

export interface DiagnosticsSection {
  title: string;
  body: string;
}

export interface FeedbackInput {
  title: string;
  description: string;
  diagnostics: DiagnosticsSection[];
}

// Returns an error message when the value is empty or too long, else undefined.
export function validateFeedbackField(
  field: 'Title' | 'Description',
  value: string,
): string | undefined {
  const maxLength = field === 'Title' ? MAX_TITLE_LENGTH : MAX_DESCRIPTION_LENGTH;
  const length = Array.from(value.trim()).length;

  if (length === 0) {
    return `${field} is required.`;
  }

  if (length > maxLength) {
    return `${field} must be at most ${maxLength} characters (got ${length}).`;
  }

  return undefined;
}

export interface SubmitFeedbackOptions {
  source?: string;
  signal?: AbortSignal;
}

// POST /stores/{storeHash}/v0/feedback (api-proxy). The proxy forwards it to
// the Feedback gRPC service, which files a Linear issue. Returns 204.
export async function submitFeedback(
  feedback: FeedbackInput,
  storeHash: string,
  accessToken: string,
  apiHost: string,
  { source = FEEDBACK_SOURCE, signal }: SubmitFeedbackOptions = {},
): Promise<void> {
  const response = await fetch(`https://${apiHost}/stores/${storeHash}/v0/feedback`, {
    method: 'POST',
    signal,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Auth-Token': accessToken,
      'X-Correlation-Id': getTelemetry().correlationId,
    },
    body: JSON.stringify({
      source,
      title: feedback.title,
      description: feedback.description,
      diagnostics: feedback.diagnostics,
    }),
  });

  assertAuthorized(response);

  if (!response.ok) {
    throw await httpError(response, 'Failed to submit feedback');
  }
}
