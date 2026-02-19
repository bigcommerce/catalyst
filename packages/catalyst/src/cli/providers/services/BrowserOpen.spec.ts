import { Effect, Layer } from 'effect';
import { describe, expect, test, vi } from 'vitest';

import { BrowserOpenError } from '../../core/errors';

import { BrowserOpen, BrowserOpenLive } from './BrowserOpen';

// Mock the 'open' module so we don't actually open a browser
vi.mock('open', () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

describe('BrowserOpen service', () => {
  test('calls open with the provided URL', async () => {
    const { default: openMock } = await import('open');

    const program = Effect.gen(function* () {
      const browser = yield* BrowserOpen;

      yield* browser.open('https://example.com');
    });

    await Effect.runPromise(program.pipe(Effect.provide(BrowserOpenLive)));

    expect(openMock).toHaveBeenCalledWith('https://example.com');
  });
});

describe('BrowserOpen test layer', () => {
  test('can use a test implementation', async () => {
    const urls: string[] = [];

    const TestBrowserOpen = Layer.succeed(BrowserOpen, {
      open: (url) => {
        urls.push(url);

        return Effect.void;
      },
    });

    const program = Effect.gen(function* () {
      const browser = yield* BrowserOpen;

      yield* browser.open('https://test.com');
    });

    await Effect.runPromise(program.pipe(Effect.provide(TestBrowserOpen)));

    expect(urls).toEqual(['https://test.com']);
  });

  test('test layer can simulate errors', async () => {
    const TestBrowserOpen = Layer.succeed(BrowserOpen, {
      open: () => Effect.fail(new BrowserOpenError({ message: 'simulated' })),
    });

    const program = Effect.gen(function* () {
      const browser = yield* BrowserOpen;

      yield* browser.open('https://test.com');
    });

    const exit = await Effect.runPromiseExit(program.pipe(Effect.provide(TestBrowserOpen)));

    expect(exit._tag).toBe('Failure');
  });
});
