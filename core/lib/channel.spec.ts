import { afterEach, describe, expect, it, vi } from 'vitest';

const getLocale = vi.fn<() => Promise<string>>();
const getChannelIdFromLocale = vi.fn<(locale?: string) => string | undefined>();

vi.mock('next-intl/server', () => ({
  getLocale: () => getLocale(),
}));

vi.mock('../channels.config', () => ({
  getChannelIdFromLocale: (locale?: string) => getChannelIdFromLocale(locale),
}));

import { getCurrentChannelId } from './channel';

afterEach(() => {
  getLocale.mockReset();
  getChannelIdFromLocale.mockReset();
});

describe('getCurrentChannelId', () => {
  it('uses the channel mapped to the request locale', async () => {
    getLocale.mockResolvedValue('fr');
    getChannelIdFromLocale.mockReturnValue('1899883');

    await expect(getCurrentChannelId('1844232')).resolves.toBe('1899883');
    expect(getChannelIdFromLocale).toHaveBeenCalledWith('fr');
  });

  it('uses the default channel when the locale has no mapping', async () => {
    getLocale.mockResolvedValue('en');
    getChannelIdFromLocale.mockReturnValue('1844232');

    await expect(getCurrentChannelId('1844232')).resolves.toBe('1844232');
    expect(getChannelIdFromLocale).toHaveBeenCalledWith('en');
  });

  it('asks for the default channel when the request has no locale', async () => {
    getLocale.mockRejectedValue(new Error('not supported in route handlers'));
    getChannelIdFromLocale.mockReturnValue('1844232');

    await expect(getCurrentChannelId()).resolves.toBe('1844232');
    expect(getChannelIdFromLocale).toHaveBeenCalledWith(undefined);
  });

  it('uses the explicit fallback when no channel is configured', async () => {
    getLocale.mockResolvedValue('en');
    getChannelIdFromLocale.mockReturnValue(undefined);

    await expect(getCurrentChannelId('1844232')).resolves.toBe('1844232');
  });
});
