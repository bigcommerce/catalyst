import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { type ChannelSiteDetails } from './channels';
import {
  managedCheckoutHostname,
  resolveProvisionedCheckoutUrl,
  sharesMainDomain,
  suggestCheckoutUrl,
  warnOnCrossDomainCheckout,
} from './checkout-url';
import { consola } from './logger';

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

  // Native hosting provisions `c.<project>.<zone>`, so suggesting
  // `checkout.<project>.<zone>` would name a hostname nobody will create.
  test('suggests the prefix native hosting provisions on a managed zone', () => {
    expect(
      suggestCheckoutUrl('https://catalyst.catalyst-sandbox.store', { managedZone: true }),
    ).toBe('https://c.catalyst.catalyst-sandbox.store');
  });

  // The shape the whole native-hosting checkout design rests on: two levels
  // deep still shares a registrable domain with its storefront.
  test('keeps the managed-zone suggestion inside the same main domain', () => {
    const storefront = 'https://catalyst.catalyst-sandbox.store';
    const suggestion = suggestCheckoutUrl(storefront, { managedZone: true });

    if (!suggestion) throw new Error('expected a suggestion');

    expect(sharesMainDomain(new URL(storefront).hostname, new URL(suggestion).hostname)).toBe(true);
  });
});

describe('warnOnCrossDomainCheckout', () => {
  // Same consequence, so both warn — but the cause differs, and conflating them
  // either blames the merchant for a platform default or downplays a real
  // misconfiguration.
  test('distinguishes an inherited checkout URL from a stranded custom one', () => {
    warnOnCrossDomainCheckout(crossDomainSite);

    expect(consola.warn).toHaveBeenCalledWith(expect.stringContaining("default channel's domain"));
    // The consequence is one shared info line, not repeated in each warning.
    expect(consola.info).toHaveBeenCalledWith(
      expect.stringContaining('may not carry into checkout'),
    );

    vi.clearAllMocks();
    warnOnCrossDomainCheckout({ ...crossDomainSite, isCheckoutUrlCustomized: true });

    expect(consola.warn).toHaveBeenCalledWith(expect.stringContaining('left it behind'));
  });

  test('stays silent when checkout shares the storefront domain', () => {
    warnOnCrossDomainCheckout(
      site([
        { url: 'https://catalyst-demo.site', type: 'primary' },
        { url: 'https://checkout.catalyst-demo.site', type: 'checkout' },
      ]),
    );

    expect(consola.warn).not.toHaveBeenCalled();
  });

  test('stays silent when the site has no checkout URL to compare', () => {
    warnOnCrossDomainCheckout(site([{ url: 'https://catalyst-demo.site', type: 'primary' }]));

    expect(consola.warn).not.toHaveBeenCalled();
  });

  test('stays silent when the storefront URL cannot be parsed', () => {
    warnOnCrossDomainCheckout(
      site([
        { url: 'not a url', type: 'primary' },
        { url: 'https://checkout.example.com', type: 'checkout' },
      ]),
    );

    expect(consola.warn).not.toHaveBeenCalled();
  });

  test('stays silent when the checkout URL cannot be parsed', () => {
    warnOnCrossDomainCheckout(
      site([
        { url: 'https://example.com', type: 'primary' },
        { url: 'not a url', type: 'checkout' },
      ]),
    );

    expect(consola.warn).not.toHaveBeenCalled();
  });

  test('falls back to site.url when the site has no primary entry', () => {
    warnOnCrossDomainCheckout({
      ...site([{ url: 'https://unrelated.mybigcommerce.com', type: 'checkout' }]),
      url: 'https://example.com',
    });

    expect(consola.warn).toHaveBeenCalledWith(expect.stringContaining("default channel's domain"));
  });

  test('warns and advises a checkout subdomain for a storefront on its own domain', () => {
    const report = warnOnCrossDomainCheckout(
      site([
        { url: 'https://www.example.com', type: 'primary' },
        { url: 'https://store-abc.mybigcommerce.com', type: 'checkout' },
      ]),
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

  test('reports not-cross-domain when checkout already matches the storefront', () => {
    const report = warnOnCrossDomainCheckout(
      site([
        { url: 'https://www.example.com', type: 'primary' },
        { url: 'https://checkout.example.com', type: 'checkout' },
      ]),
    );

    expect(report.crossDomain).toBe(false);
    // Still carries a suggestion, so a caller can offer one where none is set.
    expect(report.suggestion).toBe('https://checkout.example.com');
  });

  // The signal that replaced "is this a registered custom domain": a real
  // vanity domain that happens not to be on any project must still be treated
  // as the merchant's own, and an auto-generated hostname that *is* registered
  // as a project domain must still be treated as managed.
  test('classifies by hosting zone, not by project domain registration', () => {
    const vanity = warnOnCrossDomainCheckout(
      site([
        { url: 'https://canary.catalyst-demo.site', type: 'primary' },
        { url: 'https://store-abc-1.mybigcommerce.com', type: 'checkout' },
      ]),
    );

    expect(vanity.storefrontOnManagedZone).toBe(false);

    const managed = warnOnCrossDomainCheckout(
      site([
        { url: 'https://anything.catalyst-sandbox.store', type: 'primary' },
        { url: 'https://store-abc-1.mybigcommerce.com', type: 'checkout' },
      ]),
    );

    expect(managed.storefrontOnManagedZone).toBe(true);
  });

  // Merchant domains added with `catalyst domains add` are listed alongside the
  // generated hostname, so a zone derived from that list would claim them.
  test('does not treat a merchant subdomain as the managed zone', () => {
    const report = warnOnCrossDomainCheckout(
      site([
        { url: 'https://vanity.project-one.example.com', type: 'primary' },
        { url: 'https://store-abc-1.mybigcommerce.com', type: 'checkout' },
      ]),
    );

    expect(report.storefrontOnManagedZone).toBe(false);
    expect(report.suggestion).toBe('https://checkout.vanity.project-one.example.com');
  });

  // Setting the checkout URL is what provisions it, so the advice is the
  // command that sets it rather than a wait on something else.
  test('prints the command that provisions the managed-zone checkout hostname', () => {
    const report = warnOnCrossDomainCheckout(crossDomainSite);

    expect(consola.warn).toHaveBeenCalledWith(expect.stringContaining("default channel's domain"));
    expect(consola.info).toHaveBeenCalledWith(
      expect.stringContaining('auto-generated deployment hostname'),
    );
    expect(consola.info).toHaveBeenCalledWith(
      expect.stringContaining('checkout hostname is c.catalyst.catalyst-sandbox.store'),
    );
    expect(consola.log).toHaveBeenCalledWith(
      '  catalyst channels update --channel-id 2 --checkout-url https://c.catalyst.catalyst-sandbox.store',
    );
    expect(report.suggestion).toBe('https://c.catalyst.catalyst-sandbox.store');
  });

  // Regression: we used to tell merchants a checkout subdomain could never be
  // issued a certificate, and sent them to buy a custom domain they don't need.
  test('no longer claims a managed-zone checkout subdomain is impossible', () => {
    warnOnCrossDomainCheckout(crossDomainSite);

    const messages = vi.mocked(consola.info).mock.calls.flat().join('\n');

    expect(messages).not.toContain('catalyst domains add');
    expect(messages).not.toContain('cannot be issued a certificate');
  });
});

describe('managedCheckoutHostname', () => {
  test('prefixes the storefront hostname', () => {
    expect(managedCheckoutHostname('catalyst.catalyst-sandbox.store')).toBe(
      'c.catalyst.catalyst-sandbox.store',
    );
  });

  // ignition derives the same name from the same prefix, so this has to agree
  // with it rather than be transported over the API.
  test('shares a main domain with its storefront', () => {
    const storefront = 'catalyst.catalyst-sandbox.store';
    const checkout = managedCheckoutHostname(storefront);

    if (!checkout) throw new Error('expected a hostname');

    expect(sharesMainDomain(storefront, checkout)).toBe(true);
  });

  // Hostnames generated before ignition reserved room for the prefix can be too
  // long, and those projects have no checkout hostname to point at.
  test('returns undefined when the result exceeds the certificate name limit', () => {
    const atLimit = `${'a'.repeat(62 - '.catalyst-sandbox.store'.length)}.catalyst-sandbox.store`;

    expect(managedCheckoutHostname(atLimit)).toBe(`c.${atLimit}`);
    expect(managedCheckoutHostname(`a${atLimit}`)).toBeUndefined();
  });
});

describe('resolveProvisionedCheckoutUrl', () => {
  const storefront = 'catalyst.catalyst-sandbox.store';

  test('returns the checkout URL once the hostname serves a certificate', async () => {
    server.use(
      http.head('https://c.catalyst.catalyst-sandbox.store/', () =>
        HttpResponse.json(null, { status: 302 }),
      ),
    );

    await expect(resolveProvisionedCheckoutUrl(storefront)).resolves.toBe(
      'https://c.catalyst.catalyst-sandbox.store',
    );
  });

  // Setting a checkout URL whose certificate has not issued leaves checkout
  // resolving without one, which is worse for a shopper than the inherited URL
  // it would replace. So give up rather than write it.
  test('gives up rather than set a URL that is not serving yet', async () => {
    server.use(http.head('https://c.catalyst.catalyst-sandbox.store/', () => HttpResponse.error()));

    await expect(
      resolveProvisionedCheckoutUrl(storefront, { timeoutMs: 0 }),
    ).resolves.toBeUndefined();
    expect(consola.warn).toHaveBeenCalledWith(expect.stringContaining('not serving a certificate'));
  });

  test('gives up when the storefront hostname is too long to take a prefix', async () => {
    const tooLong = `${'a'.repeat(63 - '.catalyst-sandbox.store'.length)}.catalyst-sandbox.store`;

    await expect(resolveProvisionedCheckoutUrl(tooLong)).resolves.toBeUndefined();
    expect(consola.warn).toHaveBeenCalledWith(
      expect.stringContaining('too long to take a checkout prefix'),
    );
  });
});
