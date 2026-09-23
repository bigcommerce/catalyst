import { http, HttpResponse } from 'msw';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

import { server } from '../../../tests/mocks/node';

import {
  type Channel,
  channelPlatformLabel,
  deleteChannelCheckoutUrl,
  findChannelSiteUrl,
  getChannelSite,
  sortChannelsByPlatform,
  updateChannelCheckoutUrl,
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

const sitePath = 'https://:apiHost/stores/:storeHash/v3/channels/:channelId/site';
const checkoutPath = `${sitePath}/checkout-url`;

const siteBody = {
  id: 7,
  url: 'https://example.com',
  channel_id: channelId,
  ssl_status: null,
  is_checkout_url_customized: true,
  urls: [
    { url: 'https://example.com', type: 'primary' },
    { url: 'https://store-abc-1.mybigcommerce.com', type: 'canonical' },
    { url: 'https://checkout.example.com', type: 'checkout' },
  ],
};

describe('getChannelSite', () => {
  test('maps the site, tolerating the null ssl_status the API really returns', async () => {
    server.use(http.get(sitePath, () => HttpResponse.json({ data: siteBody })));

    const site = await getChannelSite(channelId, storeHash, accessToken, apiHost);

    expect(site).toEqual({
      id: 7,
      url: 'https://example.com',
      channelId,
      sslStatus: null,
      isCheckoutUrlCustomized: true,
      urls: [
        { url: 'https://example.com', type: 'primary' },
        { url: 'https://store-abc-1.mybigcommerce.com', type: 'canonical' },
        { url: 'https://checkout.example.com', type: 'checkout' },
      ],
    });
  });

  // The narrower `PUT .../site` response omits these, so they must default
  // rather than fail to parse.
  test('defaults the optional fields when the response omits them', async () => {
    server.use(
      http.get(sitePath, () =>
        HttpResponse.json({ data: { id: 7, url: 'https://example.com', channel_id: channelId } }),
      ),
    );

    const site = await getChannelSite(channelId, storeHash, accessToken, apiHost);

    expect(site.sslStatus).toBeNull();
    expect(site.isCheckoutUrlCustomized).toBe(false);
    expect(site.urls).toEqual([]);
  });

  test('throws with a re-auth hint on 403', async () => {
    server.use(http.get(sitePath, () => HttpResponse.json({}, { status: 403 })));

    await expect(getChannelSite(channelId, storeHash, accessToken, apiHost)).rejects.toThrow(
      'Re-run `catalyst auth login`',
    );
  });

  test('throws a readable error on other failures', async () => {
    server.use(http.get(sitePath, () => HttpResponse.json({}, { status: 500 })));

    await expect(getChannelSite(channelId, storeHash, accessToken, apiHost)).rejects.toThrow(
      'Failed to fetch channel site: Something went wrong on our end.',
    );
  });
});

describe('updateChannelCheckoutUrl', () => {
  test('PUTs the url to the hyphenated channel-scoped path and returns the site', async () => {
    let receivedBody: unknown;
    let receivedChannelId: string | undefined;

    server.use(
      http.put(checkoutPath, async ({ request, params }) => {
        receivedBody = await request.json();
        receivedChannelId = String(params.channelId);

        return HttpResponse.json({ data: siteBody });
      }),
    );

    const site = await updateChannelCheckoutUrl(
      channelId,
      'https://checkout.example.com',
      storeHash,
      accessToken,
      apiHost,
    );

    expect(receivedBody).toEqual({ url: 'https://checkout.example.com' });
    expect(receivedChannelId).toBe(String(channelId));
    expect(site.isCheckoutUrlCustomized).toBe(true);
  });

  // The same-main-domain rule is enforced by BigCommerce, not locally, so its
  // explanation has to survive the trip to the user verbatim.
  test("surfaces BigCommerce's same-main-domain 422 verbatim", async () => {
    server.use(
      http.put(checkoutPath, () =>
        HttpResponse.json(
          {
            status: 422,
            title: 'Incorrect checkout url https://checkout.example.org.',
            detail:
              'Your checkout and storefront must be within the same main domain like "main.com" and "subdomain.main.com"',
          },
          { status: 422 },
        ),
      ),
    );

    await expect(
      updateChannelCheckoutUrl(
        channelId,
        'https://checkout.example.org',
        storeHash,
        accessToken,
        apiHost,
      ),
    ).rejects.toThrow('must be within the same main domain');
  });

  test('throws with a re-auth hint on 401', async () => {
    server.use(http.put(checkoutPath, () => HttpResponse.json({}, { status: 401 })));

    await expect(
      updateChannelCheckoutUrl(channelId, 'https://c.example.com', storeHash, accessToken, apiHost),
    ).rejects.toThrow('Re-run `catalyst auth login`');
  });
});

describe('deleteChannelCheckoutUrl', () => {
  test('DELETEs the checkout url', async () => {
    let called = false;

    server.use(
      http.delete(checkoutPath, () => {
        called = true;

        return new HttpResponse(null, { status: 204 });
      }),
    );

    await expect(
      deleteChannelCheckoutUrl(channelId, storeHash, accessToken, apiHost),
    ).resolves.toBeUndefined();
    expect(called).toBe(true);
  });

  test('throws with a re-auth hint on 403', async () => {
    server.use(http.delete(checkoutPath, () => HttpResponse.json({}, { status: 403 })));

    await expect(
      deleteChannelCheckoutUrl(channelId, storeHash, accessToken, apiHost),
    ).rejects.toThrow('Re-run `catalyst auth login`');
  });

  test('throws a readable error on other failures', async () => {
    server.use(http.delete(checkoutPath, () => HttpResponse.json({}, { status: 500 })));

    await expect(
      deleteChannelCheckoutUrl(channelId, storeHash, accessToken, apiHost),
    ).rejects.toThrow('Failed to remove channel checkout URL: Something went wrong on our end.');
  });
});

describe('findChannelSiteUrl', () => {
  const site = {
    id: 7,
    url: 'https://example.com',
    channelId,
    sslStatus: null,
    isCheckoutUrlCustomized: true,
    urls: [
      { url: 'https://example.com', type: 'primary' },
      { url: 'https://checkout.example.com', type: 'checkout' },
    ],
  };

  test('returns the url for a role, or undefined when absent', () => {
    expect(findChannelSiteUrl(site, 'checkout')).toBe('https://checkout.example.com');
    expect(findChannelSiteUrl(site, 'canonical')).toBeUndefined();
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
