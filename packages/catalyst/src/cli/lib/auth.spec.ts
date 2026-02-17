import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { server } from '../../../tests/mocks/node';

import {
  DEFAULT_LOGIN_URL,
  DEVICE_OAUTH_CLIENT_ID,
  DEVICE_OAUTH_SCOPES,
  pollDeviceToken,
  requestDeviceCode,
  waitForDeviceToken,
} from './auth';

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('requestDeviceCode', () => {
  test('returns device code response on success', async () => {
    const result = await requestDeviceCode(DEFAULT_LOGIN_URL);

    expect(result).toEqual({
      device_code: 'mock-device-code',
      user_code: 'MOCK-CODE',
      verification_uri: 'https://login.bigcommerce.com/device',
      expires_in: 600,
      interval: 5,
    });
  });

  test('throws on non-OK response', async () => {
    server.use(
      http.post(
        'https://login.bigcommerce.com/device/token',
        () => new HttpResponse(null, { status: 500, statusText: 'Internal Server Error' }),
      ),
    );

    await expect(requestDeviceCode(DEFAULT_LOGIN_URL)).rejects.toThrow(
      'Failed to request device code: 500 Internal Server Error',
    );
  });

  test('throws on malformed response', async () => {
    server.use(
      http.post('https://login.bigcommerce.com/device/token', () =>
        HttpResponse.json({ invalid: 'data' }),
      ),
    );

    await expect(requestDeviceCode(DEFAULT_LOGIN_URL)).rejects.toThrow();
  });
});

describe('pollDeviceToken', () => {
  test('returns null on non-200 response', async () => {
    server.use(
      http.post(
        'https://login.bigcommerce.com/device/token',
        () => new HttpResponse(null, { status: 400 }),
      ),
    );

    const result = await pollDeviceToken(DEFAULT_LOGIN_URL, 'mock-device-code');

    expect(result).toBeNull();
  });

  test('returns credentials on 200 response', async () => {
    const result = await pollDeviceToken(DEFAULT_LOGIN_URL, 'mock-device-code');

    expect(result).toEqual({
      access_token: 'mock-access-token',
      store_hash: 'mock-store-hash',
      context: 'stores/mock-store-hash',
      api_uri: 'https://api.bigcommerce.com',
    });
  });
});

describe('waitForDeviceToken', () => {
  test('polls until success', async () => {
    vi.useFakeTimers();

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

    const promise = waitForDeviceToken(DEFAULT_LOGIN_URL, 'mock-device-code', 1);

    // Advance timers to allow polling
    await vi.advanceTimersByTimeAsync(1000);
    await vi.advanceTimersByTimeAsync(1000);

    const result = await promise;

    expect(result).toEqual({
      access_token: 'mock-access-token',
      store_hash: 'mock-store-hash',
      context: 'stores/mock-store-hash',
      api_uri: 'https://api.bigcommerce.com',
    });

    vi.useRealTimers();
  });
});

describe('constants', () => {
  test('DEVICE_OAUTH_CLIENT_ID matches create-catalyst', () => {
    expect(DEVICE_OAUTH_CLIENT_ID).toBe('s1q4io7mah2lm1i6uwp9yl1eit80n3b');
  });

  test('DEVICE_OAUTH_SCOPES contains expected scopes', () => {
    expect(DEVICE_OAUTH_SCOPES).toContain('store_v2_information');
    expect(DEVICE_OAUTH_SCOPES).toContain('store_infrastructure_deployments_manage');
    expect(DEVICE_OAUTH_SCOPES).toContain('store_infrastructure_logs_read_only');
    expect(DEVICE_OAUTH_SCOPES).toContain('store_infrastructure_projects_manage');
  });

  test('DEFAULT_LOGIN_URL is correct', () => {
    expect(DEFAULT_LOGIN_URL).toBe('https://login.bigcommerce.com');
  });
});
