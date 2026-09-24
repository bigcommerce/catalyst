import { confirm, select } from '@inquirer/prompts';
import { http, HttpResponse } from 'msw';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { server } from '../../../tests/mocks/node';

import { deployedChannelId, offerChannelUrlUpdates } from './deploy-channel-urls';
import { consola } from './logger';
import { getProjectConfig } from './project-config';

vi.mock('@inquirer/prompts', () => ({
  select: vi.fn(),
  confirm: vi.fn(),
  input: vi.fn(),
}));

const confirmMock = vi.mocked(confirm);
const selectMock = vi.mocked(select);

const storeHash = 'test-store';
const accessToken = 'test-token';
const apiHost = 'api.bigcommerce.com';
const projectUuid = 'a23f5785-fd99-4a94-9fb3-945551623923';
const storefront = 'project-one.catalyst-sandbox.store';

const sitePath = 'https://:apiHost/stores/:storeHash/v3/channels/:channelId/site';
const checkoutPath = `${sitePath}/checkout-url`;

let dir: string;
let config: ReturnType<typeof getProjectConfig>;

// A channel still on its canonical storefront URL and the default channel's
// checkout, as a fresh one is. Writing the site URL moves the primary, so the
// reads after it see the new one.
const freshChannel = ({
  primary: startingPrimary = 'https://store-abc-2.mybigcommerce.com',
  checkout = 'https://store-abc-1.mybigcommerce.com',
  customized = false,
}: { primary?: string; checkout?: string; customized?: boolean } = {}) => {
  const writes: { site?: unknown; checkout?: unknown } = {};
  let primary = startingPrimary;

  server.use(
    http.get(sitePath, () =>
      HttpResponse.json({
        data: {
          id: 1,
          url: primary,
          channel_id: 2,
          ssl_status: null,
          is_checkout_url_customized: customized,
          urls: [
            { url: primary, type: 'primary' },
            { url: checkout, type: 'checkout' },
          ],
        },
      }),
    ),
    http.put(sitePath, async ({ request }) => {
      const body: unknown = await request.json();

      writes.site = body;
      primary =
        typeof body === 'object' && body !== null && 'url' in body && typeof body.url === 'string'
          ? body.url
          : primary;

      return HttpResponse.json({ data: { id: 1, url: primary, channel_id: 2 } });
    }),
    http.put(checkoutPath, async ({ request }) => {
      writes.checkout = await request.json();

      return HttpResponse.json({ data: { id: 1, url: primary, channel_id: 2 } });
    }),
    http.head(`https://c.${storefront}/`, () => HttpResponse.json(null, { status: 302 })),
  );

  return writes;
};

const run = (overrides: Partial<Parameters<typeof offerChannelUrlUpdates>[0]> = { channelId: 2 }) =>
  offerChannelUrlUpdates({
    storeHash,
    accessToken,
    apiHost,
    projectUuid,
    config,
    deploymentHostname: storefront,
    ...overrides,
  });

beforeAll(() => {
  consola.mockTypes(() => vi.fn());
});

beforeEach(() => {
  vi.clearAllMocks();
  dir = mkdtempSync(join(tmpdir(), 'deploy-channel-urls-'));
  config = getProjectConfig(dir);
  Object.defineProperty(process.stdin, 'isTTY', { value: true, configurable: true });
});

afterEach(() => {
  Object.defineProperty(process.stdin, 'isTTY', { value: false, configurable: true });
  rmSync(dir, { recursive: true, force: true });
});

describe('offerChannelUrlUpdates', () => {
  test('points the site and checkout at the deployment when both are accepted', async () => {
    const writes = freshChannel();

    confirmMock.mockResolvedValueOnce(true).mockResolvedValueOnce(true);

    await run();

    expect(writes.site).toEqual({ url: `https://${storefront}` });
    expect(writes.checkout).toEqual({ url: `https://c.${storefront}` });
    // Neither the channel nor the hostname is asked for; the deploy knows both.
    expect(selectMock).not.toHaveBeenCalled();
    // Unasked-for after a deploy, so Enter leaves both URLs alone.
    expect(confirmMock).toHaveBeenNthCalledWith(1, expect.objectContaining({ default: false }));
    expect(confirmMock).toHaveBeenNthCalledWith(2, expect.objectContaining({ default: false }));
  });

  // Declining is remembered for the channel so later deploys stay quiet.
  test('saves a declined site URL and does not ask again', async () => {
    const writes = freshChannel();

    confirmMock.mockResolvedValueOnce(false);

    await run();

    expect(writes.site).toBeUndefined();
    expect(config.get('declinedSiteUrlChannels')).toEqual([2]);

    vi.clearAllMocks();
    await run();

    expect(confirmMock).not.toHaveBeenCalled();
  });

  test('warns and saves the decline when moving checkout is declined', async () => {
    const writes = freshChannel();

    confirmMock.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

    await run();

    expect(writes.site).toEqual({ url: `https://${storefront}` });
    expect(writes.checkout).toBeUndefined();
    expect(consola.warn).toHaveBeenCalledWith(expect.stringContaining("default channel's domain"));
    expect(config.get('declinedSiteUrlChannels')).toBeUndefined();
    expect(config.get('declinedCheckoutUrlChannels')).toEqual([2]);

    // The next deploy finds the site already pointed here and stays quiet.
    vi.clearAllMocks();
    await run();

    expect(confirmMock).not.toHaveBeenCalled();
  });

  // Checked on its own, so a checkout left behind is offered even when the site
  // URL was set some other way or on an earlier deploy.
  test('offers checkout when the site already points at the project', async () => {
    const writes = freshChannel({ primary: `https://${storefront}` });

    confirmMock.mockResolvedValueOnce(true);

    await run();

    expect(confirmMock).toHaveBeenCalledTimes(1);
    expect(writes.site).toBeUndefined();
    expect(writes.checkout).toEqual({ url: `https://c.${storefront}` });
  });

  // A custom checkout URL on another domain was the merchant's choice.
  test('leaves a custom checkout URL on another domain alone', async () => {
    freshChannel({
      primary: `https://${storefront}`,
      checkout: 'https://checkout.example.com',
      customized: true,
    });

    await run();

    expect(confirmMock).not.toHaveBeenCalled();
  });

  test('does not offer when the channel already points at the project', async () => {
    freshChannel();
    server.use(
      http.get(sitePath, () =>
        HttpResponse.json({
          data: {
            id: 1,
            url: `https://${storefront}/`,
            channel_id: 2,
            ssl_status: null,
            is_checkout_url_customized: false,
            urls: [{ url: `https://${storefront}/`, type: 'primary' }],
          },
        }),
      ),
    );

    await run();

    expect(confirmMock).not.toHaveBeenCalled();
  });

  // A merchant domain's checkout is theirs to set up, so there is no `c.`
  // offer; the diagnostic explains what to do instead.
  test('warns without offering checkout for a merchant domain', async () => {
    const writes = freshChannel();

    confirmMock.mockResolvedValueOnce(true);

    await run({ channelId: 2, deploymentHostname: 'vanity.project-one.example.com' });

    expect(confirmMock).toHaveBeenCalledTimes(1);
    expect(writes.checkout).toBeUndefined();
    expect(consola.info).toHaveBeenCalledWith(
      expect.stringContaining('checkout.vanity.project-one.example.com at BigCommerce'),
    );
  });

  // The deploy normally reports its hostname; only without one is it asked for.
  test('asks for the hostname when the deploy did not report one', async () => {
    const writes = freshChannel();

    confirmMock.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    selectMock.mockResolvedValueOnce(storefront);

    await run({ channelId: 2, deploymentHostname: undefined });

    expect(selectMock).toHaveBeenCalledTimes(1);
    expect(writes.site).toEqual({ url: `https://${storefront}` });
  });

  test('stays quiet without a TTY or a known channel', async () => {
    freshChannel();

    await run({});

    Object.defineProperty(process.stdin, 'isTTY', { value: false, configurable: true });
    await run();

    expect(confirmMock).not.toHaveBeenCalled();
  });
});

describe('deployedChannelId', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  // Matches what the storefront serves: OpenNext applies the worker's bindings
  // first and only fills unset keys from the baked env files.
  test('prefers a deployment secret over the env files', () => {
    vi.stubEnv('BIGCOMMERCE_CHANNEL_ID', '7');

    expect(deployedChannelId([{ type: 'secret', key: 'BIGCOMMERCE_CHANNEL_ID', value: '9' }])).toBe(
      9,
    );
    expect(deployedChannelId([])).toBe(7);
  });

  test('ignores a missing or malformed value', () => {
    delete process.env.BIGCOMMERCE_CHANNEL_ID;

    expect(deployedChannelId([])).toBeUndefined();
    expect(
      deployedChannelId([{ type: 'secret', key: 'BIGCOMMERCE_CHANNEL_ID', value: 'abc' }]),
    ).toBeUndefined();
  });
});
