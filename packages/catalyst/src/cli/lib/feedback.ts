import { assertAuthorized } from './auth-errors';
import { httpError } from './http-errors';
import { getTelemetry } from './telemetry';

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
  source?: string;
  signal?: AbortSignal;
}

export function validateFeedbackField(field: FeedbackField, value: string): string | undefined {
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
