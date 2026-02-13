import { afterEach, beforeAll, beforeEach, describe, expect, MockInstance, test, vi } from 'vitest';

const mockTelemetryInstance = {
  trackError: vi.fn().mockResolvedValue(undefined),
  traceId: vi.fn().mockReturnValue('test-trace-uuid'),
  isEnabled: vi.fn().mockReturnValue(false),
  analytics: {
    closeAndFlush: vi.fn().mockResolvedValue(undefined),
  },
};

vi.mock('./telemetry', () => ({
  getTelemetry: vi.fn(() => mockTelemetryInstance),
}));

import { withErrorHandler } from './error-handler';
import { consola } from './logger';

let exitMock: MockInstance;

beforeAll(() => {
  consola.wrapAll();
});

beforeEach(() => {
  consola.mockTypes(() => vi.fn());
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  exitMock = vi.spyOn(process, 'exit').mockImplementation(() => null as never);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('withErrorHandler', () => {
  test('calls action without intercepting on success', async () => {
    const action = vi.fn().mockResolvedValue(undefined);
    const wrapped = withErrorHandler('test-cmd', action);

    await wrapped('arg1', 'arg2');

    expect(action).toHaveBeenCalledWith('arg1', 'arg2');
    expect(mockTelemetryInstance.trackError).not.toHaveBeenCalled();
    expect(mockTelemetryInstance.analytics.closeAndFlush).not.toHaveBeenCalled();
    expect(exitMock).not.toHaveBeenCalled();
  });

  test('handles Error objects', async () => {
    const error = new Error('Something went wrong');
    const action = vi.fn().mockRejectedValue(error);
    const wrapped = withErrorHandler('deploy', action);

    await wrapped();

    expect(mockTelemetryInstance.trackError).toHaveBeenCalledWith('deploy', error);
    expect(mockTelemetryInstance.analytics.closeAndFlush).toHaveBeenCalled();
    expect(consola.error).toHaveBeenCalledWith('Something went wrong');
    expect(consola.info).toHaveBeenCalledWith(expect.stringContaining('Trace ID: test-trace-uuid'));
    expect(exitMock).toHaveBeenCalledWith(1);
  });

  test('handles non-Error values', async () => {
    const action = vi.fn().mockRejectedValue('string error');
    const wrapped = withErrorHandler('deploy', action);

    await wrapped();

    expect(consola.error).toHaveBeenCalledWith('string error');
    expect(exitMock).toHaveBeenCalledWith(1);
  });

  test('shows telemetry enable nudge when telemetry is disabled', async () => {
    mockTelemetryInstance.isEnabled.mockReturnValue(false);

    const action = vi.fn().mockRejectedValue(new Error('fail'));
    const wrapped = withErrorHandler('deploy', action);

    await wrapped();

    expect(consola.info).toHaveBeenCalledWith(
      expect.stringContaining(
        'Enable telemetry (`catalyst telemetry enable`) so this Trace ID can be looked up by support.',
      ),
    );
  });

  test('shows share message when telemetry is enabled', async () => {
    mockTelemetryInstance.isEnabled.mockReturnValue(true);

    const action = vi.fn().mockRejectedValue(new Error('fail'));
    const wrapped = withErrorHandler('deploy', action);

    await wrapped();

    expect(consola.info).toHaveBeenCalledWith(
      expect.stringContaining('Share this Trace ID with BigCommerce support.'),
    );
  });

  test('still exits when trackError throws', async () => {
    mockTelemetryInstance.trackError.mockRejectedValueOnce(new Error('telemetry down'));

    const action = vi.fn().mockRejectedValue(new Error('original error'));
    const wrapped = withErrorHandler('deploy', action);

    await wrapped();

    expect(consola.error).toHaveBeenCalledWith('original error');
    expect(exitMock).toHaveBeenCalledWith(1);
  });
});
