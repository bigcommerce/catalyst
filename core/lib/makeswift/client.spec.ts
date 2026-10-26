import { AsyncLocalStorage } from 'node:async_hooks';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  process.env.MAKESWIFT_SITE_API_KEY = 'test-api-key';

  const cacheEntries = new Map<string, unknown>();
  const cacheOptions: unknown[] = [];

  return {
    getPageSnapshot: vi.fn(),
    getComponentSnapshot: vi.fn<(id: string, options: { locale?: string }) => Promise<unknown>>(),
    getSiteVersion: vi.fn(),
    getLocale: vi.fn(),
    cacheEntries,
    cacheOptions,
  };
});

vi.mock('@makeswift/runtime/next', () => ({
  Makeswift: class {
    getPageSnapshot = mocks.getPageSnapshot;
    getComponentSnapshot = mocks.getComponentSnapshot;
  },
}));

vi.mock('@makeswift/runtime/next/server', () => ({ getSiteVersion: mocks.getSiteVersion }));

vi.mock('next-intl/server', () => ({ getLocale: mocks.getLocale }));

vi.mock('~/i18n/locale-config', () => ({
  getLocaleRouting: () => Promise.resolve({ defaultLocale: 'en' }),
}));

vi.mock('./runtime', () => ({ runtime: {} }));

// Stands in for the request's async context, which `unstable_cache` replaces in its callback.
const context = new AsyncLocalStorage<string>();

vi.mock('next/cache', () => ({
  unstable_cache:
    (fn: (...args: unknown[]) => Promise<unknown>, keyParts: string[], options: unknown) =>
    async (...args: unknown[]) => {
      mocks.cacheOptions.push(options);

      const key = JSON.stringify([keyParts, args]);

      if (!mocks.cacheEntries.has(key)) {
        mocks.cacheEntries.set(key, await context.run('unstable-cache', () => fn(...args)));
      }

      return mocks.cacheEntries.get(key);
    },
}));

const { getComponentSnapshot, getPageSnapshot } = await import('./client');

const draftVersion = { version: 'working', token: 'preview-token' };
const pageSnapshot = { document: { id: 'page' } };

function notFoundError() {
  return Object.assign(new Error('Not found'), { status: 404 });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.cacheEntries.clear();
  mocks.cacheOptions.length = 0;
  mocks.getSiteVersion.mockResolvedValue(null);
  mocks.getLocale.mockResolvedValue('en');
});

describe('getPageSnapshot', () => {
  it('caches a missing page with the Makeswift revalidation tag and a short TTL', async () => {
    mocks.getPageSnapshot.mockResolvedValue(null);

    await expect(getPageSnapshot({ path: '/wp-login.php', locale: 'en' })).resolves.toBeNull();
    await expect(getPageSnapshot({ path: '/wp-login.php', locale: 'en' })).resolves.toBeNull();

    expect(mocks.getPageSnapshot).toHaveBeenCalledTimes(1);
    expect(mocks.cacheOptions[0]).toEqual({ tags: ['@@makeswift'], revalidate: 300 });
  });

  it('keys the missing page cache by path and locale', async () => {
    mocks.getPageSnapshot.mockResolvedValue(null);

    await getPageSnapshot({ path: '/a', locale: 'en' });
    await getPageSnapshot({ path: '/b', locale: 'en' });
    await getPageSnapshot({ path: '/a', locale: 'fr' });

    expect(mocks.getPageSnapshot).toHaveBeenCalledTimes(3);
    expect(mocks.getPageSnapshot).toHaveBeenLastCalledWith('/a', {
      siteVersion: null,
      locale: 'fr',
    });
  });

  it('fetches found pages through the regular client call', async () => {
    mocks.getPageSnapshot.mockResolvedValue(pageSnapshot);

    await expect(
      context.run('request', () => getPageSnapshot({ path: '/about', locale: 'en' })),
    ).resolves.toBe(pageSnapshot);

    expect(mocks.getPageSnapshot).toHaveBeenLastCalledWith('/about', {
      siteVersion: null,
      locale: undefined,
    });
  });

  it('bypasses the cache in draft mode', async () => {
    mocks.getSiteVersion.mockResolvedValue(draftVersion);
    mocks.getPageSnapshot.mockResolvedValueOnce(null).mockResolvedValueOnce(pageSnapshot);

    await expect(getPageSnapshot({ path: '/new', locale: 'en' })).resolves.toBeNull();
    await expect(getPageSnapshot({ path: '/new', locale: 'en' })).resolves.toBe(pageSnapshot);

    expect(mocks.cacheOptions).toHaveLength(0);
    expect(mocks.getPageSnapshot).toHaveBeenCalledWith('/new', {
      siteVersion: draftVersion,
      locale: undefined,
    });
  });

  it('looks up pages in the caller context so their fetches stay cached', async () => {
    const contexts: Array<string | undefined> = [];

    mocks.getPageSnapshot.mockImplementation(() => {
      contexts.push(context.getStore());

      return Promise.resolve(pageSnapshot);
    });

    await context.run('request', () => getPageSnapshot({ path: '/about', locale: 'en' }));

    expect(contexts).toEqual(['request', 'request']);
  });
});

describe('getComponentSnapshot', () => {
  it('caches a missing locale and goes straight to the default locale', async () => {
    mocks.getLocale.mockResolvedValue('fr');
    mocks.getComponentSnapshot.mockImplementation((_id: string, { locale }: { locale?: string }) =>
      locale === 'fr' ? Promise.reject(notFoundError()) : Promise.resolve({ key: 'default' }),
    );

    await expect(getComponentSnapshot('site-header')).resolves.toEqual({ key: 'default' });
    await expect(getComponentSnapshot('site-header')).resolves.toEqual({ key: 'default' });

    const localizedCalls = mocks.getComponentSnapshot.mock.calls.filter(
      ([, options]) => options.locale === 'fr',
    );

    expect(localizedCalls).toHaveLength(1);
  });

  it('does not probe the default locale', async () => {
    mocks.getComponentSnapshot.mockResolvedValue({ key: 'default' });

    await getComponentSnapshot('site-header');

    expect(mocks.cacheOptions).toHaveLength(0);
    expect(mocks.getComponentSnapshot).toHaveBeenCalledTimes(1);
  });

  it('does not cache other errors', async () => {
    mocks.getLocale.mockResolvedValue('fr');
    mocks.getComponentSnapshot.mockRejectedValue(new Error('boom'));

    await expect(getComponentSnapshot('site-header')).rejects.toThrow('boom');

    expect(mocks.cacheEntries.size).toBe(0);
  });

  it('falls back to the default locale on a 404 in draft mode', async () => {
    mocks.getSiteVersion.mockResolvedValue(draftVersion);
    mocks.getLocale.mockResolvedValue('fr');
    mocks.getComponentSnapshot
      .mockRejectedValueOnce(notFoundError())
      .mockResolvedValueOnce({ key: 'default' });

    await expect(getComponentSnapshot('site-header')).resolves.toEqual({ key: 'default' });

    expect(mocks.cacheOptions).toHaveLength(0);
    expect(mocks.getComponentSnapshot).toHaveBeenLastCalledWith('site-header', {
      siteVersion: draftVersion,
      locale: undefined,
    });
  });
});
