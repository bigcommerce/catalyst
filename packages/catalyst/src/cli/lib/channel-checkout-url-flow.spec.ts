import { input, select } from '@inquirer/prompts';
import { http, HttpResponse } from 'msw';
import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { server } from '../../../tests/mocks/node';

import { runChannelCheckoutUrlFlow } from './channel-checkout-url-flow';
import { consola } from './logger';

vi.mock('@inquirer/prompts', () => ({
  select: vi.fn(),
  confirm: vi.fn(),
  input: vi.fn(),
}));

const selectMock = vi.mocked(select);
const inputMock = vi.mocked(input);

const storeHash = 'test-store';
const accessToken = 'test-token';
const apiHost = 'api.bigcommerce.com';

const api = { storeHash, accessToken, apiHost };
const sitePath = 'https://:apiHost/stores/:storeHash/v3/channels/:channelId/site';
const checkoutPath = `${sitePath}/checkout-url`;

beforeAll(() => {
  consola.mockTypes(() => vi.fn());

  vi.mock('./telemetry', () => {
    const instance = {
      identify: vi.fn(),
      isEnabled: vi.fn(() => true),
      track: vi.fn(),
      correlationId: 'test-session-uuid',
      commandName: 'unknown',
      durationMs: vi.fn().mockReturnValue(0),
      analytics: { closeAndFlush: vi.fn().mockResolvedValue(undefined) },
    };

    return {
      Telemetry: vi.fn().mockImplementation(() => instance),
      getTelemetry: vi.fn(() => instance),
      resetTelemetry: vi.fn(),
    };
  });
});

beforeEach(() => {
  vi.clearAllMocks();
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('runChannelCheckoutUrlFlow', () => {
  test('prompts with the checkout subdomain of the storefront and writes the answer', async () => {
    let putBody: unknown;

    server.use(
      http.get(sitePath, () =>
        HttpResponse.json({
          data: {
            id: 1,
            url: 'https://www.example.com',
            channel_id: 2,
            is_checkout_url_customized: false,
            urls: [{ url: 'https://www.example.com', type: 'primary' }],
          },
        }),
      ),
      http.put(checkoutPath, async ({ request }) => {
        putBody = await request.json();

        return HttpResponse.json({
          data: { id: 1, url: 'https://www.example.com', channel_id: 2 },
        });
      }),
    );

    inputMock.mockResolvedValueOnce('https://checkout.example.com');

    await runChannelCheckoutUrlFlow({ ...api, channelId: 2 });

    expect(inputMock).toHaveBeenCalledWith(
      expect.objectContaining({ default: 'https://checkout.example.com' }),
    );
    expect(putBody).toEqual({ url: 'https://checkout.example.com' });
    expect(consola.success).toHaveBeenCalledWith(
      expect.stringContaining('checkout URL to https://checkout.example.com'),
    );
  });

  test('--url skips the prompt', async () => {
    let putBody: unknown;

    server.use(
      http.put(checkoutPath, async ({ request }) => {
        putBody = await request.json();

        return HttpResponse.json({ data: { id: 1, url: 'https://example.com', channel_id: 2 } });
      }),
    );

    await runChannelCheckoutUrlFlow({ ...api, channelId: 2, url: 'checkout.example.com' });

    expect(inputMock).not.toHaveBeenCalled();
    expect(putBody).toEqual({ url: 'https://checkout.example.com' });
  });

  test('prompts for the channel when no channelId is given', async () => {
    selectMock.mockResolvedValueOnce(2);
    inputMock.mockResolvedValueOnce('https://checkout.example.com');

    await runChannelCheckoutUrlFlow(api);

    expect(selectMock).toHaveBeenCalledTimes(1);
    expect(consola.success).toHaveBeenCalledWith(
      expect.stringContaining('"Catalyst Storefront" (2)'),
    );
  });

  // An inherited checkout URL is the state this flow usually exists to replace,
  // so it needs to be visible before the merchant is asked for a new one.
  test('reports an inherited checkout URL before prompting', async () => {
    server.use(
      http.get(sitePath, () =>
        HttpResponse.json({
          data: {
            id: 1,
            url: 'https://www.example.com',
            channel_id: 2,
            is_checkout_url_customized: false,
            urls: [
              { url: 'https://www.example.com', type: 'primary' },
              { url: 'https://unrelated.mybigcommerce.com', type: 'checkout' },
            ],
          },
        }),
      ),
    );

    inputMock.mockResolvedValueOnce('https://checkout.example.com');

    await runChannelCheckoutUrlFlow({ ...api, channelId: 2 });

    expect(consola.info).toHaveBeenCalledWith(
      expect.stringContaining('inherited from the default channel'),
    );
  });

  test('rejects a non-https answer without calling the API', async () => {
    let called = false;

    server.use(
      http.put(checkoutPath, () => {
        called = true;

        return HttpResponse.json({ data: {} });
      }),
    );

    inputMock.mockResolvedValueOnce('http://checkout.example.com');

    await expect(runChannelCheckoutUrlFlow({ ...api, channelId: 2 })).rejects.toThrow(
      'must use https',
    );
    expect(called).toBe(false);
  });
});
