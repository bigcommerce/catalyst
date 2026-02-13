import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

vi.unmock('./telemetry');

// eslint-disable-next-line import/dynamic-import-chunkname
const { Telemetry, getTelemetry, resetTelemetry } = await import('./telemetry');

beforeEach(() => {
  resetTelemetry();
});

afterEach(() => {
  resetTelemetry();
});

describe('Telemetry', () => {
  test('sessionId is a valid UUID', () => {
    const telemetry = new Telemetry();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    expect(telemetry.sessionId).toMatch(uuidRegex);
  });

  test('traceId returns sessionId', () => {
    const telemetry = new Telemetry();

    expect(telemetry.traceId()).toBe(telemetry.sessionId);
  });

  test('durationMs returns elapsed time', async () => {
    const telemetry = new Telemetry();

    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });

    expect(telemetry.durationMs()).toBeGreaterThanOrEqual(40);
  });

  test('trackError sends error event when enabled', async () => {
    const telemetry = new Telemetry();
    const trackSpy = vi.spyOn(telemetry, 'track');

    vi.spyOn(telemetry, 'isEnabled').mockReturnValue(true);

    const error = new Error('test error');

    await telemetry.trackError('deploy', error);

    expect(trackSpy).toHaveBeenCalledWith(
      'error',
      expect.objectContaining({
        commandName: 'deploy',
        errorMessage: 'test error',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        errorStack: expect.stringContaining('test error'),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        durationMs: expect.any(Number),
      }),
    );
  });

  test('trackError no-ops when disabled', async () => {
    const telemetry = new Telemetry();
    const analyticsSpy = vi.spyOn(telemetry.analytics, 'track');

    vi.spyOn(telemetry, 'isEnabled').mockReturnValue(false);

    await telemetry.trackError('deploy', new Error('test'));

    expect(analyticsSpy).not.toHaveBeenCalled();
  });
});

describe('getTelemetry', () => {
  test('returns same instance on repeated calls', () => {
    const first = getTelemetry();
    const second = getTelemetry();

    expect(first).toBe(second);
  });

  test('resetTelemetry causes fresh instance', () => {
    const first = getTelemetry();

    resetTelemetry();

    const second = getTelemetry();

    expect(first).not.toBe(second);
    expect(first.sessionId).not.toBe(second.sessionId);
  });
});
