import { http, HttpResponse } from 'msw';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

import { server } from '../../../tests/mocks/node';

import { updateChannelSiteUrl } from './channels';

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

  test('throws with status on other errors', async () => {
    server.use(
      http.put('https://:apiHost/stores/:storeHash/v3/channels/:channelId/site', () =>
        HttpResponse.json({}, { status: 500 }),
      ),
    );

    await expect(
      updateChannelSiteUrl(channelId, 'https://x.example', storeHash, accessToken, apiHost),
    ).rejects.toThrow('Failed to update channel site: 500');
  });
});
