import { afterAll, afterEach, beforeAll, vi } from 'vitest';

import { server } from './tests/mocks/node';

// Default all specs to a non-interactive stdin so TTY-gated prompts don't fire
// based on whether the test runner happens to inherit a terminal. Tests that
// need to exercise interactive branches opt in explicitly (see the
// `withTtyValue` helpers in the specs).
Object.defineProperty(process.stdin, 'isTTY', { value: false, configurable: true });

const mockTelemetryInstance = {
  correlationId: 'test-session-uuid',
  commandName: 'unknown',
  analytics: {
    track: vi.fn(),
    identify: vi.fn(),
    closeAndFlush: vi.fn().mockResolvedValue(undefined),
  },
  track: vi.fn().mockResolvedValue(undefined),
  identify: vi.fn().mockResolvedValue(undefined),
  startTime: 0,
  durationMs: vi.fn().mockReturnValue(0),
  setEnabled: vi.fn(),
  isEnabled: vi.fn().mockReturnValue(false),
};

vi.mock('../src/lib/telemetry', () => ({
  Telemetry: vi.fn().mockImplementation(() => mockTelemetryInstance),
  getTelemetry: vi.fn(() => mockTelemetryInstance),
  resetTelemetry: vi.fn(),
}));

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
