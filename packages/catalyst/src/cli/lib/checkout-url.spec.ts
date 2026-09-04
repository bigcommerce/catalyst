import { http, HttpResponse } from 'msw';
import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { server } from '../../../tests/mocks/node';

import { type ChannelSiteDetails } from './channels';
import { sharesMainDomain, suggestCheckoutUrl, warnOnCrossDomainCheckout } from './checkout-url';
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

  test('is case-insensitive and tolerates a trailing dot', () => {
    expect(sharesMainDomain('Example.COM', 'checkout.example.com')).toBe(true);
    expect(sharesMainDomain('example.com.', 'checkout.example.com')).toBe(true);
  });

  test('treats siblings under a shared parent as sharing', () => {
    expect(sharesMainDomain('www.example.com', 'checkout.example.com')).toBe(true);
    expect(sharesMainDomain('shop.example.co.uk', 'checkout.example.co.uk')).toBe(true);
  });

  // A bare public suffix must never be the thing that makes two hostnames
  // match. Comparing last-two-labels collapsed both of these to `co.uk` and
  // stayed silent on a genuinely cross-domain checkout.
  test('does not let a multi-part public suffix mask a cross-domain pair', () => {
    expect(sharesMainDomain('www.example.co.uk', 'checkout.other.co.uk')).toBe(false);
    expect(sharesMainDomain('www.example.com.au', 'checkout.other.com.au')).toBe(false);
  });

  // Documents the remaining imprecision and its direction: deeply nested pairs
  // read as not sharing, which costs a redundant warning rather than a missed
  // one. The write path never consults this.
  test('known limitation: deeply nested siblings read as not sharing', () => {
    expect(sharesMainDomain('a.b.example.com', 'c.d.example.com')).toBe(false);
  });
});

describe('suggestCheckoutUrl', () => {
  test('suggests the checkout sibling of the storefront domain', () => {
    expect(suggestCheckoutUrl('https://www.example.com')).toBe('https://checkout.example.com');
    expect(suggestCheckoutUrl('https://catalyst-demo.site')).toBe(
      'https://checkout.catalyst-demo.site',
    );
  });

  // Reducing to the last two labels suggested `https://checkout.co.uk` here,
  // which pre-filled the deploy prompt with a domain the merchant doesn't own.
  test('never suggests a bare public suffix', () => {
    expect(suggestCheckoutUrl('https://www.example.co.uk')).toBe('https://checkout.example.co.uk');
    expect(suggestCheckoutUrl('https://www.example.com.au')).toBe(
      'https://checkout.example.com.au',
    );
  });

  test('always suggests a hostname that satisfies the same-main-domain rule', () => {
    const storefront = 'https://shop.example.co.uk';
    const suggestion = suggestCheckoutUrl(storefront);

    if (!suggestion) throw new Error('expected a suggestion');

    expect(sharesMainDomain(new URL(storefront).hostname, new URL(suggestion).hostname)).toBe(true);
  });

  test('returns undefined for an unparseable storefront URL', () => {
    expect(suggestCheckoutUrl('not a url')).toBeUndefined();
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
