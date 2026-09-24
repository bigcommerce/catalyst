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

describe('runChannelCheckoutUrlFlow on a managed hosting zone', () => {
  const storefrontHostname = 'project-one.catalyst-sandbox.store';
  const checkoutUrl = 'https://c.project-one.catalyst-sandbox.store';
  const probe = 'https://c.project-one.catalyst-sandbox.store/';

  const siteWith = (isCheckoutUrlCustomized: boolean, checkout?: string) =>
    http.get(sitePath, () =>
      HttpResponse.json({
        data: {
          id: 1,
          url: `https://${storefrontHostname}`,
          channel_id: 2,
          ssl_status: null,
          is_checkout_url_customized: isCheckoutUrlCustomized,
          urls: [
            { url: `https://${storefrontHostname}`, type: 'primary' },
            ...(checkout ? [{ url: checkout, type: 'checkout' }] : []),
          ],
        },
      }),
    );

  const trackWrites = () => {
    const writes: { put: unknown; deleted: boolean } = { put: undefined, deleted: false };

    server.use(
      http.put(checkoutPath, async ({ request }) => {
        writes.put = await request.json();

        return HttpResponse.json({ data: { id: 1, url: checkoutUrl, channel_id: 2 } });
      }),
      http.delete(checkoutPath, () => {
        writes.deleted = true;

        return new HttpResponse(null, { status: 204 });
      }),
    );

    return writes;
  };

  const run = (overrides: Partial<Parameters<typeof runChannelCheckoutUrlFlow>[0]> = {}) =>
    runChannelCheckoutUrlFlow({ ...api, channelId: 2, storefrontHostname, ...overrides });

  // The write is what provisions the hostname, so it can't wait for the
  // certificate first — it writes, then waits.
  test('sets the checkout hostname without prompting, then waits for its certificate', async () => {
    const writes = trackWrites();

    server.use(
      siteWith(false, 'https://store-abc-1.mybigcommerce.com'),
      http.head(probe, () => HttpResponse.json(null, { status: 302 })),
    );

    await run();

    expect(writes.put).toEqual({ url: checkoutUrl });
    expect(inputMock).not.toHaveBeenCalled();
    expect(consola.success).toHaveBeenCalledWith(
      'c.project-one.catalyst-sandbox.store is serving checkout.',
    );
  });

  test('explains the wait while the certificate issues', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout'] });

    let probes = 0;

    trackWrites();
    server.use(
      siteWith(false),
      http.head(probe, () => {
        probes += 1;

        return probes === 1 ? HttpResponse.error() : HttpResponse.json(null, { status: 302 });
      }),
    );

    const done = run();

    while (probes === 0 || vi.getTimerCount() === 0) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setImmediate(resolve));
    }

    await vi.advanceTimersByTimeAsync(10_000);
    await done;

    expect(consola.info).toHaveBeenCalledWith(
      expect.stringContaining('Waiting for c.project-one.catalyst-sandbox.store'),
    );

    vi.useRealTimers();
  });

  // Checkout on a hostname without a certificate is broken for shoppers, so
  // falling back to the default channel's checkout is the better failure.
  test('removes the checkout URL when the certificate never issues', async () => {
    const writes = trackWrites();

    server.use(
      siteWith(false),
      http.head(probe, () => HttpResponse.error()),
    );

    await run({ certificateTimeoutMs: 0 });

    expect(writes.put).toEqual({ url: checkoutUrl });
    expect(writes.deleted).toBe(true);
    expect(consola.warn).toHaveBeenCalledWith(
      expect.stringContaining("wasn't issued a certificate in time"),
    );
  });

  // Writing it again would ask BigCommerce to register a hostname it holds.
  test('only waits when the checkout hostname is already set', async () => {
    const writes = trackWrites();

    server.use(
      siteWith(true, `${checkoutUrl}/`),
      http.head(probe, () => HttpResponse.json(null, { status: 302 })),
    );

    await run();

    expect(writes.put).toBeUndefined();
    expect(consola.success).toHaveBeenCalledWith(
      'c.project-one.catalyst-sandbox.store is serving checkout.',
    );
  });

  test('leaves a different custom checkout URL alone', async () => {
    const writes = trackWrites();

    server.use(siteWith(true, 'https://checkout.example.com'));

    await run({ channelName: 'Storefront' });

    expect(writes.put).toBeUndefined();
    expect(consola.info).toHaveBeenCalledWith(
      expect.stringContaining('Channel "Storefront" (2) already has a custom checkout URL'),
    );
  });

  test('leaves checkout alone when the hostname is too long to take a prefix', async () => {
    const writes = trackWrites();
    const tooLong = `${'a'.repeat(63 - '.catalyst-sandbox.store'.length)}.catalyst-sandbox.store`;

    await run({ storefrontHostname: tooLong });

    expect(writes.put).toBeUndefined();
    expect(inputMock).not.toHaveBeenCalled();
    expect(consola.warn).toHaveBeenCalledWith(
      expect.stringContaining('too long to take a checkout prefix'),
    );
  });

  // Off the managed zone the `c.` subdomain is the merchant's DNS, so there is
  // nothing to derive and the flow prompts as before. A merchant domain added
  // with `catalyst domains add` is listed among the project's hostnames, which
  // is exactly the case that must not be mistaken for the managed zone.
  test('prompts for a merchant domain listed among the project hostnames', async () => {
    const writes = trackWrites();

    inputMock.mockResolvedValueOnce('https://checkout.project-one.example.com');

    await run({ storefrontHostname: 'vanity.project-one.example.com' });

    expect(inputMock).toHaveBeenCalled();
    expect(writes.put).toEqual({ url: 'https://checkout.project-one.example.com' });
  });
});
