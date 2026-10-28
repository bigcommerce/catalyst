import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AnalyticsProvider } from './types';

function createProvider(name: string, calls: string[]): AnalyticsProvider {
  return {
    initialize: vi.fn(() => calls.push(`${name}:initialize`)),
    cart: {
      cartViewed: vi.fn(),
      productAdded: vi.fn(),
      productRemoved: vi.fn(),
    },
    navigation: {
      categoryViewed: vi.fn(),
      productViewed: vi.fn(() => calls.push(`${name}:productViewed`)),
    },
    consent: {
      consentUpdated: vi.fn(),
    },
  };
}

// Analytics is a singleton, so each test loads a fresh module.
async function createAnalytics(providers: AnalyticsProvider[]) {
  vi.resetModules();

  const { Analytics } = await import('.');

  return new Analytics({ channelId: 1, providers });
}

const payload = { currency: 'USD', value: 10, items: [] };

describe('Analytics', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('initializes providers once, before the first event', async () => {
    const calls: string[] = [];
    const analytics = await createAnalytics([createProvider('ga', calls)]);

    analytics.navigation.productViewed(payload);
    analytics.initialize();

    expect(calls).toEqual(['ga:initialize', 'ga:productViewed']);
  });

  it('retries a provider whose initialization failed', async () => {
    const calls: string[] = [];
    const provider = createProvider('ga', calls);

    vi.mocked(provider.initialize).mockImplementationOnce(() => {
      throw new Error('consent unavailable');
    });

    const analytics = await createAnalytics([provider]);

    analytics.initialize();
    analytics.navigation.productViewed(payload);

    expect(provider.initialize).toHaveBeenCalledTimes(2);
    expect(calls).toEqual(['ga:initialize', 'ga:productViewed']);
  });

  it('keeps sending events to other providers when one fails to initialize', async () => {
    const calls: string[] = [];
    const failing = createProvider('failing', calls);
    const working = createProvider('working', calls);

    vi.mocked(failing.initialize).mockImplementation(() => {
      throw new Error('broken');
    });

    const analytics = await createAnalytics([failing, working]);

    analytics.navigation.productViewed(payload);

    expect(calls).toEqual(['working:initialize', 'working:productViewed']);
    expect(failing.navigation.productViewed).not.toHaveBeenCalled();
  });
});
