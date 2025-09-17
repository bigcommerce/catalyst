import { afterAll, afterEach, beforeAll, vi } from 'vitest';

import { server } from './tests/mocks/node';

vi.mock('../src/lib/telemetry', () => ({
  Telemetry: vi.fn().mockImplementation(() => ({
    sessionId: 'test-session-id',
    analytics: {
      track: vi.fn(),
      identify: vi.fn(),
      closeAndFlush: vi.fn().mockResolvedValue(undefined),
    },
    track: vi.fn().mockResolvedValue(undefined),
    identify: vi.fn().mockResolvedValue(undefined),
    setEnabled: vi.fn(),
    isEnabled: vi.fn().mockReturnValue(false),
  })),
}));

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
