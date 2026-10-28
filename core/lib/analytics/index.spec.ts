import { describe, expect, it, vi } from 'vitest';

import type { AnalyticsProvider } from './types';

import { Analytics } from '.';

function createProvider(calls: string[]): AnalyticsProvider {
  return {
    initialize: vi.fn(() => calls.push('initialize')),
    cart: {
      cartViewed: vi.fn(),
      productAdded: vi.fn(),
      productRemoved: vi.fn(),
    },
    navigation: {
      categoryViewed: vi.fn(),
      productViewed: vi.fn(() => calls.push('productViewed')),
    },
    consent: {
      consentUpdated: vi.fn(),
    },
  };
}

describe('Analytics', () => {
  it('initializes providers once, before the first event', () => {
    const calls: string[] = [];
    const provider = createProvider(calls);
    const analytics = new Analytics({ channelId: 1, providers: [provider] });

    analytics.navigation.productViewed({ currency: 'USD', value: 10, items: [] });
    analytics.initialize();

    expect(calls).toEqual(['initialize', 'productViewed']);
  });
});
