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
const freshChannel = () => {
  const writes: { site?: unknown; checkout?: unknown } = {};
  let primary = 'https://store-abc-2.mybigcommerce.com';

  server.use(
    http.get(sitePath, () =>
      HttpResponse.json({
        data: {
          id: 1,
          url: primary,
          channel_id: 2,
          ssl_status: null,
          is_checkout_url_customized: false,
          urls: [
            { url: primary, type: 'primary' },
            { url: 'https://store-abc-1.mybigcommerce.com', type: 'checkout' },
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

const run = (overrides: { channelId?: number } = { channelId: 2 }) =>
  offerChannelUrlUpdates({
    storeHash,
    accessToken,
    apiHost,
    projectUuid,
    config,
    deploymentHostname: storefront,
    ...overrides,
  });

// The picker order in runChannelSiteUrlFlow: channel, then hostname.
const pickChannelAndHostname = () =>
  selectMock.mockResolvedValueOnce(2).mockResolvedValueOnce(storefront);

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
    pickChannelAndHostname();

    await run();

    expect(writes.site).toEqual({ url: `https://${storefront}` });
    expect(writes.checkout).toEqual({ url: `https://c.${storefront}` });
    // The deployed channel is pre-selected, not assumed.
    expect(selectMock).toHaveBeenCalledWith(expect.objectContaining({ default: 2 }));
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

  // Declining the checkout URL isn't saved: the site URL prompt that leads to
  // it won't come back, so the warning is the last word.
  test('warns instead of moving checkout when that is declined', async () => {
    const writes = freshChannel();

    confirmMock.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    pickChannelAndHostname();

    await run();

    expect(writes.site).toEqual({ url: `https://${storefront}` });
    expect(writes.checkout).toBeUndefined();
    expect(consola.warn).toHaveBeenCalledWith(expect.stringContaining("default channel's domain"));
    expect(config.get('declinedSiteUrlChannels')).toBeUndefined();
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
    selectMock.mockResolvedValueOnce(2).mockResolvedValueOnce('vanity.project-one.example.com');

    await run();

    expect(confirmMock).toHaveBeenCalledTimes(1);
    expect(writes.checkout).toBeUndefined();
    expect(consola.info).toHaveBeenCalledWith(
      expect.stringContaining('checkout.vanity.project-one.example.com at BigCommerce'),
    );
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

  test('reads the build env first, then a stored secret', () => {
    vi.stubEnv('BIGCOMMERCE_CHANNEL_ID', '7');

    expect(deployedChannelId([{ type: 'secret', key: 'BIGCOMMERCE_CHANNEL_ID', value: '9' }])).toBe(
      7,
    );

    vi.unstubAllEnvs();
    delete process.env.BIGCOMMERCE_CHANNEL_ID;

    expect(deployedChannelId([{ type: 'secret', key: 'BIGCOMMERCE_CHANNEL_ID', value: '9' }])).toBe(
      9,
    );
  });

  test('ignores a missing or malformed value', () => {
    delete process.env.BIGCOMMERCE_CHANNEL_ID;

    expect(deployedChannelId([])).toBeUndefined();
    expect(
      deployedChannelId([{ type: 'secret', key: 'BIGCOMMERCE_CHANNEL_ID', value: 'abc' }]),
    ).toBeUndefined();
  });
});
