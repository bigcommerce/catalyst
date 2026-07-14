import { http, HttpResponse } from 'msw';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

import { server } from '../../../tests/mocks/node';

import {
  type Channel,
  channelPlatformLabel,
  sortChannelsByPlatform,
  updateChannelSiteUrl,
} from './channels';

const storeHash = 'test-store';
const accessToken = 'test-token';
const apiHost = 'api.bigcommerce.com';
const channelId = 1;

beforeAll(() => {
  vi.mock('./telemetry', () => {
    const instance = {
      identify: vi.fn(),
      isEnabled: vi.fn(() => true),
      track: vi.fn(),
      correlationId: 'test-session-uuid',
      commandName: 'unknown',
      durationMs: vi.fn().mockReturnValue(0),
      analytics: {
        closeAndFlush: vi.fn().mockResolvedValue(undefined),
      },
    };

    return {
      Telemetry: vi.fn().mockImplementation(() => instance),
      getTelemetry: vi.fn(() => instance),
      resetTelemetry: vi.fn(),
    };
  });
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('updateChannelSiteUrl', () => {
  test('PUTs the URL and returns parsed channel site', async () => {
    let receivedBody: unknown;

    server.use(
      http.put(
        'https://:apiHost/stores/:storeHash/v3/channels/:channelId/site',
        async ({ request }) => {
          receivedBody = await request.json();

          return HttpResponse.json({
            data: {
              id: 42,
              url: 'https://new.example.com',
              channel_id: channelId,
            },
          });
        },
      ),
    );

    const result = await updateChannelSiteUrl(
      channelId,
      'https://new.example.com',
      storeHash,
      accessToken,
      apiHost,
    );

    expect(receivedBody).toEqual({ url: 'https://new.example.com' });
    expect(result).toEqual({ id: 42, url: 'https://new.example.com', channelId });
  });

  test('throws with re-auth hint on 401', async () => {
    server.use(
      http.put('https://:apiHost/stores/:storeHash/v3/channels/:channelId/site', () =>
        HttpResponse.json({}, { status: 401 }),
      ),
    );

    await expect(
      updateChannelSiteUrl(channelId, 'https://x.example', storeHash, accessToken, apiHost),
    ).rejects.toThrow('Re-run `catalyst auth login`');
  });

  test('throws with re-auth hint on 403', async () => {
    server.use(
      http.put('https://:apiHost/stores/:storeHash/v3/channels/:channelId/site', () =>
        HttpResponse.json({}, { status: 403 }),
      ),
    );

    await expect(
      updateChannelSiteUrl(channelId, 'https://x.example', storeHash, accessToken, apiHost),
    ).rejects.toThrow('Re-run `catalyst auth login`');
  });

  test('throws a readable error on other errors', async () => {
    server.use(
      http.put('https://:apiHost/stores/:storeHash/v3/channels/:channelId/site', () =>
        HttpResponse.json({}, { status: 500 }),
      ),
    );

    await expect(
      updateChannelSiteUrl(channelId, 'https://x.example', storeHash, accessToken, apiHost),
    ).rejects.toThrow('Failed to update channel site: Something went wrong on our end.');
  });
});

describe('sortChannelsByPlatform', () => {
  const ch = (id: number, platform: string): Channel => ({ id, name: `ch-${id}`, platform });

  test('orders catalyst → next → bigcommerce → unknown, without mutating the input', () => {
    const input = [ch(1, 'wordpress'), ch(2, 'bigcommerce'), ch(3, 'next'), ch(4, 'catalyst')];
    const sorted = sortChannelsByPlatform(input);

    expect(sorted.map((c) => c.platform)).toEqual(['catalyst', 'next', 'bigcommerce', 'wordpress']);
    // Original array is untouched.
    expect(input.map((c) => c.platform)).toEqual(['wordpress', 'bigcommerce', 'next', 'catalyst']);
  });
});

describe('channelPlatformLabel', () => {
  test('maps bigcommerce to Stencil and title-cases the rest', () => {
    expect(channelPlatformLabel('bigcommerce')).toBe('Stencil');
    expect(channelPlatformLabel('catalyst')).toBe('Catalyst');
    expect(channelPlatformLabel('next')).toBe('Next');
  });
});
