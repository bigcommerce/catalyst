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

const projectsPath = 'https://:apiHost/stores/:storeHash/v3/infrastructure/projects';

// The managed hosting zone is derived from the store's own deployment
// hostnames, so `catalyst-sandbox.store` is the zone in these fixtures.
const projectsWithZone = () =>
  server.use(
    http.get(projectsPath, () =>
      HttpResponse.json({
        data: [
          {
            uuid: projectUuid,
            name: 'Project One',
            deployment_hostnames: ['project-one.catalyst-sandbox.store'],
          },
        ],
      }),
    ),
  );

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

const context = { storeHash, accessToken, apiHost };

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

  // The case a label-counting rule got wrong: these share a registrable domain,
  // and BigCommerce accepts such a pairing, so warning on it would tell a
  // merchant to replace a working checkout URL.
  test('treats deeply nested siblings as sharing', () => {
    expect(sharesMainDomain('a.b.example.com', 'c.d.example.com')).toBe(true);
    expect(
      sharesMainDomain(
        'store-x.catalyst-sandbox-vercel.store',
        'store-x.c.catalyst-sandbox-vercel.store',
      ),
    ).toBe(true);
  });

  test('returns false for a hostname with no registrable domain', () => {
    expect(sharesMainDomain('localhost', 'example.com')).toBe(false);
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
  // Same consequence, so both warn — but the cause differs, and conflating them
  // either blames the merchant for a platform default or downplays a real
  // misconfiguration.
  test('distinguishes an inherited checkout URL from a stranded custom one', async () => {
    projectsWithZone();

    await warnOnCrossDomainCheckout(crossDomainSite, context);

    expect(consola.warn).toHaveBeenCalledWith(expect.stringContaining("default channel's domain"));
    // The consequence is one shared info line, not repeated in each warning.
    expect(consola.info).toHaveBeenCalledWith(
      expect.stringContaining('may not carry into checkout'),
    );

    vi.clearAllMocks();
    projectsWithZone();

    await warnOnCrossDomainCheckout({ ...crossDomainSite, isCheckoutUrlCustomized: true }, context);

    expect(consola.warn).toHaveBeenCalledWith(expect.stringContaining('left it behind'));
  });

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

    expect(consola.warn).toHaveBeenCalledWith(expect.stringContaining("default channel's domain"));
  });

  test('warns and advises a checkout subdomain for a storefront on its own domain', async () => {
    projectsWithZone();

    const report = await warnOnCrossDomainCheckout(
      site([
        { url: 'https://www.example.com', type: 'primary' },
        { url: 'https://store-abc.mybigcommerce.com', type: 'checkout' },
      ]),
      context,
    );

    expect(consola.warn).toHaveBeenCalledWith(expect.stringContaining("default channel's domain"));
    expect(consola.info).toHaveBeenCalledWith(
      expect.stringContaining('point checkout.example.com at BigCommerce'),
    );
    // The command to run is the caller's business now, not the diagnostic's.
    expect(report).toEqual({
      crossDomain: true,
      storefrontOnManagedZone: false,
      suggestion: 'https://checkout.example.com',
    });
  });

  test('reports not-cross-domain when checkout already matches the storefront', async () => {
    const report = await warnOnCrossDomainCheckout(
      site([
        { url: 'https://www.example.com', type: 'primary' },
        { url: 'https://checkout.example.com', type: 'checkout' },
      ]),
      context,
    );

    expect(report.crossDomain).toBe(false);
    // Still carries a suggestion, so a caller can offer one where none is set.
    expect(report.suggestion).toBe('https://checkout.example.com');
  });

  test('reports unknown zone status when the projects lookup fails', async () => {
    server.use(http.get(projectsPath, () => HttpResponse.json({}, { status: 500 })));

    const report = await warnOnCrossDomainCheckout(crossDomainSite, context);

    expect(report.crossDomain).toBe(true);
    expect(report.storefrontOnManagedZone).toBeUndefined();
  });

  // The signal that replaced "is this a registered custom domain": a real
  // vanity domain that happens not to be on any project must still be treated
  // as the merchant's own, and an auto-generated hostname that *is* registered
  // as a project domain must still be treated as managed.
  test('classifies by hosting zone, not by project domain registration', async () => {
    projectsWithZone();

    const vanity = await warnOnCrossDomainCheckout(
      site([
        { url: 'https://canary.catalyst-demo.site', type: 'primary' },
        { url: 'https://store-abc-1.mybigcommerce.com', type: 'checkout' },
      ]),
      context,
    );

    expect(vanity.storefrontOnManagedZone).toBe(false);

    const managed = await warnOnCrossDomainCheckout(
      site([
        { url: 'https://anything.catalyst-sandbox.store', type: 'primary' },
        { url: 'https://store-abc-1.mybigcommerce.com', type: 'checkout' },
      ]),
      context,
    );

    expect(managed.storefrontOnManagedZone).toBe(true);
  });

  test('explains the constraint when the storefront is on the managed hosting zone', async () => {
    projectsWithZone();

    await warnOnCrossDomainCheckout(crossDomainSite, context);

    expect(consola.warn).toHaveBeenCalledWith(expect.stringContaining("default channel's domain"));
    expect(consola.info).toHaveBeenCalledWith(
      expect.stringContaining('auto-generated deployment hostname'),
    );
    expect(consola.info).toHaveBeenCalledWith(expect.stringContaining('catalyst domains add'));
  });

  test('still warns generically when the store has no deployment hostnames yet', async () => {
    server.use(
      http.get(projectsPath, () =>
        HttpResponse.json({ data: [{ uuid: projectUuid, name: 'New', deployment_hostnames: [] }] }),
      ),
    );

    await warnOnCrossDomainCheckout(crossDomainSite, context);

    expect(consola.warn).toHaveBeenCalledWith(expect.stringContaining("default channel's domain"));
    expect(consola.info).toHaveBeenCalledWith(
      expect.stringContaining('share a main domain with the storefront'),
    );
  });

  // A failing domain lookup must degrade to the generic advice rather than
  // swallowing the warning it was only meant to tailor.
  test('still warns generically when the projects lookup fails', async () => {
    server.use(http.get(projectsPath, () => HttpResponse.json({}, { status: 500 })));

    await warnOnCrossDomainCheckout(crossDomainSite, context);

    expect(consola.warn).toHaveBeenCalledWith(expect.stringContaining("default channel's domain"));
    expect(consola.info).toHaveBeenCalledWith(
      expect.stringContaining('share a main domain with the storefront'),
    );
  });
});
