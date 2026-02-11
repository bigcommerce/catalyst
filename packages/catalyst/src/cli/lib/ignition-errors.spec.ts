import { describe, expect, test } from 'vitest';

import { getIgnitionErrorMessage } from './ignition-errors';

describe('getIgnitionErrorMessage', () => {
  test('code 10 — internal error', () => {
    expect(getIgnitionErrorMessage(10)).toBe(
      'Something went wrong on our end. Please try again. If the issue persists, contact support.',
    );
  });

  test('code 20 — bundle retrieval failure', () => {
    expect(getIgnitionErrorMessage(20)).toBe(
      "We couldn't retrieve your bundle. This is usually a temporary issue — please try deploying again. If the problem continues, contact support.",
    );
  });

  test('code 30 — bundle extraction failure', () => {
    expect(getIgnitionErrorMessage(30)).toBe(
      'Your bundle could not be extracted. This may mean your build output is too large (max 64 MB compressed / 512 MB uncompressed) or the archive is corrupted. Try reducing your build size or rebuilding your project and deploying again.',
    );
  });

  test('code 40 — build output validation failure', () => {
    const message = getIgnitionErrorMessage(40);

    expect(message).toContain("There's a problem with your build output.");
    expect(message).toContain('A worker.js file larger than 40 MB');
    expect(message).toContain('An individual asset file larger than 25 MB');
    expect(message).toContain('More than 1,000 total files in the bundle');
  });

  test('code 50 — deployment failure', () => {
    expect(getIgnitionErrorMessage(50)).toBe(
      'Deployment failed. This is usually a temporary issue — please try again. If the problem persists, contact support.',
    );
  });

  test('code 60 — deployment URL resolution failure', () => {
    expect(getIgnitionErrorMessage(60)).toBe(
      "Your code was deployed, but we couldn't determine your deployment URL. Please try deploying again. If the issue persists, contact support.",
    );
  });

  test('unknown code — fallback message', () => {
    expect(getIgnitionErrorMessage(99)).toBe(
      'Deployment failed with an unexpected error (code: 99). Please try again. If the issue persists, contact support.',
    );
  });
});
