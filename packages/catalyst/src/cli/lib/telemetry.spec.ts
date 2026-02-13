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

  test('durationMs returns elapsed time', async () => {
    const telemetry = new Telemetry();

    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });

    expect(telemetry.durationMs()).toBeGreaterThanOrEqual(40);
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
