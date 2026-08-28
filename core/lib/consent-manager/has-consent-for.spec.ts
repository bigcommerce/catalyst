import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getConsentDecision, hasConsentFor } from './has-consent-for';

const { mockCookieGet, mockCookies, mockIsCookieConsentEnabled } = vi.hoisted(() => ({
  mockCookieGet: vi.fn(),
  mockCookies: vi.fn(),
  mockIsCookieConsentEnabled: vi.fn(),
}));

vi.mock('next/headers', () => ({ cookies: mockCookies }));
vi.mock('./is-cookie-consent-enabled', () => ({
  isCookieConsentEnabled: mockIsCookieConsentEnabled,
}));

const consentCookie = (categories: string[] = []) => ({
  value: [
    `i.t:${Date.now()}`,
    'c.necessary:1',
    ...categories.map((category) => `c.${category}:1`),
  ].join(','),
});

describe('hasConsentFor', () => {
  beforeEach(() => {
    mockCookieGet.mockReset();
    mockCookies.mockResolvedValue({ get: mockCookieGet });
    mockIsCookieConsentEnabled.mockReset();
  });

  it('returns true when the consent cookie grants the category', async () => {
    mockCookieGet.mockReturnValue(consentCookie(['functionality']));
    mockIsCookieConsentEnabled.mockResolvedValue(false);

    await expect(hasConsentFor('functionality')).resolves.toBe(true);
    expect(mockIsCookieConsentEnabled).not.toHaveBeenCalled();
  });

  it('returns false when the consent cookie does not grant the category', async () => {
    mockCookieGet.mockReturnValue(consentCookie());
    mockIsCookieConsentEnabled.mockResolvedValue(false);

    await expect(hasConsentFor('functionality')).resolves.toBe(false);
    expect(mockIsCookieConsentEnabled).not.toHaveBeenCalled();
  });

  it('returns true when no cookie exists and cookie consent is disabled', async () => {
    mockCookieGet.mockReturnValue(undefined);
    mockIsCookieConsentEnabled.mockResolvedValue(false);

    await expect(hasConsentFor('functionality')).resolves.toBe(true);
  });

  it('returns false when no cookie exists and cookie consent is enabled', async () => {
    mockCookieGet.mockReturnValue(undefined);
    mockIsCookieConsentEnabled.mockResolvedValue(true);

    await expect(hasConsentFor('functionality')).resolves.toBe(false);
  });

  it('returns false when no cookie exists and the setting is unknown', async () => {
    mockCookieGet.mockReturnValue(undefined);
    mockIsCookieConsentEnabled.mockResolvedValue(null);

    await expect(hasConsentFor('functionality')).resolves.toBe(false);
    await expect(getConsentDecision('functionality')).resolves.toBe('unknown');
  });

  it('returns granted from a cookie that grants the category', async () => {
    mockCookieGet.mockReturnValue(consentCookie(['measurement']));

    await expect(getConsentDecision('measurement')).resolves.toBe('granted');
  });

  it('returns declined from a cookie without the category', async () => {
    mockCookieGet.mockReturnValue(consentCookie());

    await expect(getConsentDecision('measurement')).resolves.toBe('declined');
  });
});
