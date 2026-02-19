import { Effect, Layer } from 'effect';
import { http, HttpResponse } from 'msw';
import { describe, expect, test } from 'vitest';

import { server } from '../../../../tests/mocks/node';
import { AuthError } from '../errors';
import { DEFAULT_LOGIN_URL } from '../../lib/auth';

import { AuthService, AuthServiceLive } from './AuthService';

describe('AuthService', () => {
  describe('requestDeviceCode', () => {
    test('returns device code response on success', async () => {
      const program = Effect.gen(function* () {
        const auth = yield* AuthService;

        return yield* auth.requestDeviceCode(DEFAULT_LOGIN_URL);
      });

      const result = await Effect.runPromise(program.pipe(Effect.provide(AuthServiceLive)));

      expect(result).toEqual({
        device_code: 'mock-device-code',
        user_code: 'MOCK-CODE',
        verification_uri: 'https://login.bigcommerce.com/device',
        expires_in: 600,
        interval: 5,
      });
    });

    test('returns AuthError on non-OK response', async () => {
      server.use(
        http.post(
          'https://login.bigcommerce.com/device/token',
          () => new HttpResponse(null, { status: 500, statusText: 'Internal Server Error' }),
        ),
      );

      const program = Effect.gen(function* () {
        const auth = yield* AuthService;

        return yield* auth.requestDeviceCode(DEFAULT_LOGIN_URL);
      });

      const exit = await Effect.runPromiseExit(program.pipe(Effect.provide(AuthServiceLive)));

      expect(exit._tag).toBe('Failure');
    });

    test('returns AuthError on malformed response', async () => {
      server.use(
        http.post('https://login.bigcommerce.com/device/token', () =>
          HttpResponse.json({ invalid: 'data' }),
        ),
      );

      const program = Effect.gen(function* () {
        const auth = yield* AuthService;

        return yield* auth.requestDeviceCode(DEFAULT_LOGIN_URL);
      });

      const exit = await Effect.runPromiseExit(program.pipe(Effect.provide(AuthServiceLive)));

      expect(exit._tag).toBe('Failure');
    });
  });

  describe('waitForDeviceToken', () => {
    test('returns credentials on immediate success', async () => {
      const program = Effect.gen(function* () {
        const auth = yield* AuthService;

        return yield* auth.waitForDeviceToken(DEFAULT_LOGIN_URL, 'mock-device-code', 0);
      });

      const result = await Effect.runPromise(program.pipe(Effect.provide(AuthServiceLive)));

      expect(result).toEqual({
        access_token: 'mock-access-token',
        store_hash: 'mock-store-hash',
        context: 'stores/mock-store-hash',
        api_uri: 'https://api.bigcommerce.com',
      });
    });

    test('polls until success', async () => {
      let callCount = 0;

      server.use(
        http.post('https://login.bigcommerce.com/device/token', () => {
          callCount += 1;

          if (callCount < 3) {
            return new HttpResponse(null, { status: 400 });
          }

          return HttpResponse.json({
            access_token: 'mock-access-token',
            store_hash: 'mock-store-hash',
            context: 'stores/mock-store-hash',
            api_uri: 'https://api.bigcommerce.com',
          });
        }),
      );

      const program = Effect.gen(function* () {
        const auth = yield* AuthService;

        return yield* auth.waitForDeviceToken(DEFAULT_LOGIN_URL, 'mock-device-code', 0);
      });

      const result = await Effect.runPromise(program.pipe(Effect.provide(AuthServiceLive)));

      expect(result.access_token).toBe('mock-access-token');
      expect(callCount).toBeGreaterThanOrEqual(3);
    });
  });
});

describe('AuthService test layer', () => {
  test('can use a test implementation', async () => {
    const TestAuthService = Layer.succeed(AuthService, {
      requestDeviceCode: () =>
        Effect.succeed({
          device_code: 'test-code',
          user_code: 'TEST',
          verification_uri: 'https://test.com',
          expires_in: 300,
          interval: 5,
        }),
      waitForDeviceToken: () =>
        Effect.succeed({
          access_token: 'test-token',
          store_hash: 'test-hash',
          context: 'stores/test-hash',
          api_uri: 'https://api.test.com',
        }),
    });

    const program = Effect.gen(function* () {
      const auth = yield* AuthService;
      const code = yield* auth.requestDeviceCode('https://test.com');
      const token = yield* auth.waitForDeviceToken('https://test.com', code.device_code, 0);

      return token;
    });

    const result = await Effect.runPromise(program.pipe(Effect.provide(TestAuthService)));

    expect(result.access_token).toBe('test-token');
  });

  test('test layer can simulate errors', async () => {
    const TestAuthService = Layer.succeed(AuthService, {
      requestDeviceCode: () => Effect.fail(new AuthError({ message: 'simulated' })),
      waitForDeviceToken: () => Effect.fail(new AuthError({ message: 'simulated' })),
    });

    const program = Effect.gen(function* () {
      const auth = yield* AuthService;

      return yield* auth.requestDeviceCode('https://test.com');
    });

    const exit = await Effect.runPromiseExit(program.pipe(Effect.provide(TestAuthService)));

    expect(exit._tag).toBe('Failure');
  });
});
