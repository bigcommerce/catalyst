import { http, HttpResponse } from 'msw';
import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { server } from '../../../tests/mocks/node';

import { type ChannelSiteDetails } from './channels';
import { sharesMainDomain, warnOnCrossDomainCheckout } from './checkout-url';
import { consola } from './logger';

const storeHash = 'test-store';
const accessToken = 'test-token';
const apiHost = 'api.bigcommerce.com';
const projectUuid = 'a23f5785-fd99-4a94-9fb3-945551623923';

const domainsPath =
  'https://:apiHost/stores/:storeHash/v3/infrastructure/projects/:projectUuid/domains';

const site = (urls: Array<{ url: string; type: string }>): ChannelSiteDetails => ({
  id: 1,
  url: urls.find((entry) => entry.type === 'primary')?.url ?? 'https://example.com',
  channelId: 2,
  sslStatus: null,
  isCheckoutUrlCustomized: false,
  urls,
});

// The storefront/checkout pairing seen on a native-hosted channel whose checkout
// was never moved: an auto-generated storefront hostname and an inherited
// checkout domain from an unrelated zone.
const crossDomainSite = site([
  { url: 'https://catalyst.catalyst-sandbox.store', type: 'primary' },
  { url: 'https://catalyst-demo-site.mybigcommerce.com', type: 'checkout' },
]);

const context = { storeHash, accessToken, apiHost, projectUuid };

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

describe('sharesMainDomain', () => {
  test('treats a subdomain as sharing the parent domain', () => {
    expect(sharesMainDomain('catalyst-demo.site', 'checkout.catalyst-demo.site')).toBe(true);
    expect(sharesMainDomain('www.example.com', 'checkout.example.com')).toBe(true);
    expect(sharesMainDomain('example.com', 'example.com')).toBe(true);
  });

  test('separates unrelated domains', () => {
    expect(
      sharesMainDomain('catalyst.catalyst-sandbox.store', 'catalyst-demo-site.mybigcommerce.com'),
    ).toBe(false);
  });

  test('is case-insensitive', () => {
    expect(sharesMainDomain('Example.COM', 'checkout.example.com')).toBe(true);
  });

  // Documents the known heuristic limitation: without the public suffix list
  // these two reduce to `co.uk` and compare equal. The consequence is a missed
  // warning, never a blocked write, which is why the write path doesn't use this.
  test('known limitation: multi-part public suffixes compare equal', () => {
    expect(sharesMainDomain('www.example.co.uk', 'checkout.other.co.uk')).toBe(true);
  });
});

describe('warnOnCrossDomainCheckout', () => {
  test('stays silent when checkout shares the storefront domain', async () => {
    await warnOnCrossDomainCheckout(
      site([
        { url: 'https://catalyst-demo.site', type: 'primary' },
        { url: 'https://checkout.catalyst-demo.site', type: 'checkout' },
      ]),
      context,
    );

    expect(consola.warn).not.toHaveBeenCalled();
  });

  test('stays silent when the site has no checkout URL to compare', async () => {
    await warnOnCrossDomainCheckout(
      site([{ url: 'https://catalyst-demo.site', type: 'primary' }]),
      context,
    );

    expect(consola.warn).not.toHaveBeenCalled();
  });

  test('stays silent when the storefront URL cannot be parsed', async () => {
    await warnOnCrossDomainCheckout(
      site([
        { url: 'not a url', type: 'primary' },
        { url: 'https://checkout.example.com', type: 'checkout' },
      ]),
      context,
    );

    expect(consola.warn).not.toHaveBeenCalled();
  });

  test('stays silent when the checkout URL cannot be parsed', async () => {
    await warnOnCrossDomainCheckout(
      site([
        { url: 'https://example.com', type: 'primary' },
        { url: 'not a url', type: 'checkout' },
      ]),
      context,
    );

    expect(consola.warn).not.toHaveBeenCalled();
  });

  test('falls back to site.url when the site has no primary entry', async () => {
    await warnOnCrossDomainCheckout(
      {
        ...site([{ url: 'https://unrelated.mybigcommerce.com', type: 'checkout' }]),
        url: 'https://example.com',
      },
      context,
    );

    expect(consola.warn).toHaveBeenCalledWith(expect.stringContaining('a different domain'));
  });

  test('warns and advises a checkout subdomain when the storefront is a custom domain', async () => {
    server.use(
      http.get(domainsPath, () =>
        HttpResponse.json({
          data: [
            {
              domain: 'www.example.com',
              project_uuid: projectUuid,
              verification_status: 'verified',
            },
          ],
        }),
      ),
    );

    await warnOnCrossDomainCheckout(
      site([
        { url: 'https://www.example.com', type: 'primary' },
        { url: 'https://store-abc.mybigcommerce.com', type: 'checkout' },
      ]),
      context,
    );

    expect(consola.warn).toHaveBeenCalledWith(expect.stringContaining('a different domain'));
    expect(consola.info).toHaveBeenCalledWith(
      expect.stringContaining('point checkout.example.com at BigCommerce'),
    );
    expect(consola.log).toHaveBeenCalledWith(
      expect.stringContaining('--url https://checkout.example.com'),
    );
  });

  test('explains the constraint when the storefront is an auto-generated hostname', async () => {
    server.use(http.get(domainsPath, () => HttpResponse.json({ data: [] })));

    await warnOnCrossDomainCheckout(crossDomainSite, context);

    expect(consola.warn).toHaveBeenCalledWith(expect.stringContaining('a different domain'));
    expect(consola.info).toHaveBeenCalledWith(
      expect.stringContaining('auto-generated deployment hostname'),
    );
    expect(consola.info).toHaveBeenCalledWith(expect.stringContaining('catalyst domains add'));
  });

  test('still warns generically when no project is linked', async () => {
    await warnOnCrossDomainCheckout(crossDomainSite, { storeHash, accessToken, apiHost });

    expect(consola.warn).toHaveBeenCalledWith(expect.stringContaining('a different domain'));
    expect(consola.info).toHaveBeenCalledWith(
      expect.stringContaining('share a main domain with the storefront'),
    );
  });

  // A failing domain lookup must degrade to the generic advice rather than
  // swallowing the warning it was only meant to tailor.
  test('still warns generically when the domain lookup fails', async () => {
    server.use(http.get(domainsPath, () => HttpResponse.json({}, { status: 500 })));

    await warnOnCrossDomainCheckout(crossDomainSite, context);

    expect(consola.warn).toHaveBeenCalledWith(expect.stringContaining('a different domain'));
    expect(consola.info).toHaveBeenCalledWith(
      expect.stringContaining('share a main domain with the storefront'),
    );
  });
});
