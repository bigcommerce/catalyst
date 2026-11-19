import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import config from '../../templates/open-next.config';

// Fails if an OpenNext upgrade changes the internals the template relies on.
// Runs as Next 15, where declaring `cachePurge` skips tag checks by default.
vi.hoisted(() => {
  Reflect.set(globalThis, 'nextVersion', '15.5.28');
  Reflect.set(globalThis, 'openNextConfig', {
    default: { override: { cdnInvalidation: () => ({}) } },
  });
});

interface StoredEntry {
  body: string;
  headers: Headers;
}

class FakeCache {
  entries = new Map<string, StoredEntry>();

  async put(request: string, response: Response) {
    this.entries.set(request, {
      body: await response.text(),
      headers: new Headers(response.headers),
    });
  }

  match(request: string) {
    const entry = this.entries.get(request);

    return Promise.resolve(
      entry ? new Response(entry.body, { headers: entry.headers }) : undefined,
    );
  }

  delete(request: string) {
    return Promise.resolve(this.entries.delete(request));
  }
}

const namedCaches = new Map<string, FakeCache>();
const r2 = new Map<string, string>();
let pending: Array<Promise<unknown>> = [];

const bucket = {
  get: (key: string) => {
    const value = r2.get(key);

    return Promise.resolve(
      value === undefined
        ? null
        : { json: () => Promise.resolve(JSON.parse(value)), uploaded: new Date() },
    );
  },
  put: (key: string, value: string) => {
    r2.set(key, value);

    return Promise.resolve();
  },
  delete: (key: string) => {
    r2.delete(key);

    return Promise.resolve();
  },
};

const tagShards = {
  idFromName: (name: string) => name,
  get: () => ({
    getTagData: (tags: string[]) =>
      Promise.resolve(
        Object.fromEntries(
          tags.map((tag) => [tag, { revalidatedAt: 5, stale: null, expire: null }]),
        ),
      ),
    writeTags: () => Promise.resolve(),
  }),
};

vi.stubGlobal('caches', {
  open: (name: string) => {
    const cache = namedCaches.get(name) ?? new FakeCache();

    namedCaches.set(name, cache);

    return Promise.resolve(cache);
  },
});

function startRequest(props: Record<string, unknown>) {
  pending = [];

  const requestCache = new Map<string, Map<unknown, unknown>>();

  vi.stubGlobal('__openNextAls', {
    getStore: () => ({
      requestCache: {
        getOrCreate: (key: string) => {
          const map = requestCache.get(key) ?? new Map<unknown, unknown>();

          requestCache.set(key, map);

          return map;
        },
      },
    }),
  });

  Reflect.set(globalThis, Symbol.for('__cloudflare-context__'), {
    env: { NEXT_INC_CACHE_R2_BUCKET: bucket, NEXT_TAG_CACHE_DO_SHARDED: tagShards },
    ctx: { props, waitUntil: (promise: Promise<unknown>) => pending.push(promise) },
    cf: {},
  });
}

interface IncrementalCache {
  get(key: string, cacheType: string): Promise<{ shouldBypassTagCache?: boolean } | null>;
  set(key: string, value: unknown, cacheType: string): Promise<void>;
}

interface TagCache {
  hasBeenRevalidated(tags: string[], lastModified: number): Promise<boolean>;
  writeTags(tags: Array<{ tag: string }>): Promise<void>;
}

interface CdnInvalidation {
  invalidateTags(tags: string[]): Promise<void>;
  invalidatePaths(paths: Array<{ rawPath: string }>): Promise<void>;
}

// OpenNext resolves each override lazily; call the resolver like it does.
function resolveOverride(value: unknown): Promise<unknown> {
  const resolved: unknown =
    typeof value === 'function' ? Reflect.apply(value, undefined, []) : value;

  return Promise.resolve(resolved);
}

async function overrides() {
  const { override } = config.default;

  return {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    incrementalCache: (await resolveOverride(override?.incrementalCache)) as IncrementalCache,
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    tagCache: (await resolveOverride(override?.tagCache)) as TagCache,
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    cdn: (await resolveOverride(override?.cdnInvalidation)) as CdnInvalidation,
  };
}

const tagHeaders = (name: string) =>
  [...(namedCaches.get(name)?.entries.values() ?? [])].map((entry) => ({
    tags: entry.headers.get('cache-tag'),
    ttl: entry.headers.get('cache-control'),
  }));

function routerProps() {
  const stub = { purgeTags: vi.fn<(tags: string[]) => Promise<void>>().mockResolvedValue() };

  return { stub, props: { CATALYST_CACHE_PURGE: stub, CATALYST_CACHE_TAG_PREFIX: 'p:' } };
}

describe('open-next.config template', () => {
  beforeEach(() => {
    namedCaches.forEach((cache) => cache.entries.clear());
    r2.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('checks tags on every regional hit, with or without the purge stub', async () => {
    const { incrementalCache } = await overrides();
    const entry = { kind: 'FETCH', data: { body: 'x' }, revalidate: 60, tags: ['product'] };

    startRequest({});
    await incrementalCache.set('plain', entry, 'fetch');

    expect((await incrementalCache.get('plain', 'fetch'))?.shouldBypassTagCache).toBe(false);

    startRequest(routerProps().props);

    expect((await incrementalCache.get('plain', 'fetch'))?.shouldBypassTagCache).toBe(false);
  });

  it('keeps OpenNext’s regional tag entries without the purge stub', async () => {
    const { tagCache } = await overrides();

    startRequest({});
    await tagCache.hasBeenRevalidated(['product'], 10);
    await Promise.all(pending);

    expect(tagHeaders('sharded-do-tag-cache')).toEqual([{ tags: 'product', ttl: 'max-age=30' }]);
    expect(tagHeaders('sharded-do-tag-cache-purgeable')).toEqual([]);
  });

  it('writes purgeable regional tag entries with the purge stub', async () => {
    const { tagCache } = await overrides();

    startRequest(routerProps().props);
    await tagCache.hasBeenRevalidated(['product', '_N_T_/en/page'], 10);
    await Promise.all(pending);

    const entries = tagHeaders('sharded-do-tag-cache-purgeable');

    expect(entries.length).toBeGreaterThan(0);
    expect(entries.every(({ ttl }) => ttl === 'max-age=600')).toBe(true);
    expect(entries.flatMap(({ tags }) => tags?.split(',') ?? []).sort()).toEqual(
      expect.arrayContaining(['p:_N_T_/en/page', 'p:product']),
    );
    expect(tagHeaders('sharded-do-tag-cache')).toEqual([]);
  });

  it('keeps the short TTL for tag data whose read took too long', async () => {
    const { tagCache } = await overrides();
    let now = Date.now();

    vi.spyOn(Date, 'now').mockImplementation(() => now);
    vi.spyOn(tagShards, 'get').mockReturnValue({
      getTagData: (tags: string[]) => {
        now += 2_000;

        return Promise.resolve(
          Object.fromEntries(
            tags.map((tag) => [tag, { revalidatedAt: 5, stale: null, expire: null }]),
          ),
        );
      },
      writeTags: () => Promise.resolve(),
    });
    startRequest(routerProps().props);
    await tagCache.hasBeenRevalidated(['slow'], 10);
    await Promise.all(pending);

    expect(tagHeaders('sharded-do-tag-cache-purgeable')).toEqual([
      { tags: 'p:slow', ttl: 'max-age=30' },
    ]);
  });

  it('keeps the short TTL for a tag a purge can’t match', async () => {
    const { tagCache } = await overrides();

    startRequest(routerProps().props);
    await tagCache.hasBeenRevalidated(['_N_T_/en/item,variant'], 10);
    await Promise.all(pending);

    expect(tagHeaders('sharded-do-tag-cache-purgeable')).toEqual([
      { tags: 'p:_N_T_/en/item,p:variant', ttl: 'max-age=30' },
    ]);
  });

  it('judges concurrent reads of a tag by the earliest one', async () => {
    const { tagCache } = await overrides();

    type TagData = Record<string, { revalidatedAt: number; stale: null; expire: null }>;

    const reads: Array<(data: TagData) => void> = [];
    let now = Date.now();

    vi.spyOn(Date, 'now').mockImplementation(() => now);
    vi.spyOn(tagShards, 'get').mockReturnValue({
      getTagData: () =>
        new Promise<TagData>((resolve) => {
          reads.push(resolve);
        }),
      writeTags: () => Promise.resolve(),
    });
    startRequest(routerProps().props);

    const first = tagCache.hasBeenRevalidated(['x'], 10);

    await vi.waitFor(() => expect(reads).toHaveLength(1));
    await tagCache.writeTags([{ tag: 'x' }]);
    now += 3_000;

    const second = tagCache.hasBeenRevalidated(['x'], 10);

    await vi.waitFor(() => expect(reads).toHaveLength(2));
    reads.forEach((resolve) => resolve({ x: { revalidatedAt: 5, stale: null, expire: null } }));
    await Promise.all([first, second]);
    await Promise.all(pending);

    expect(tagHeaders('sharded-do-tag-cache-purgeable').map(({ ttl }) => ttl)).toEqual([
      'max-age=30',
    ]);
  });

  it('clears the local purgeable tag entry when tags are written', async () => {
    const { tagCache } = await overrides();

    startRequest(routerProps().props);
    await tagCache.hasBeenRevalidated(['product'], 10);
    await Promise.all(pending);
    await tagCache.writeTags([{ tag: 'product' }]);

    expect(tagHeaders('sharded-do-tag-cache-purgeable')).toEqual([]);
  });

  it('clears a purgeable tag entry when the tag is written without the stub', async () => {
    const { tagCache } = await overrides();

    startRequest(routerProps().props);
    await tagCache.hasBeenRevalidated(['product'], 10);
    await Promise.all(pending);
    startRequest({});
    await tagCache.writeTags([{ tag: 'product' }]);

    expect(tagHeaders('sharded-do-tag-cache-purgeable')).toEqual([]);
  });

  it('does not wait on another request’s tag write', async () => {
    const { tagCache, cdn } = await overrides();
    const { stub, props } = routerProps();

    vi.spyOn(tagShards, 'get').mockReturnValue({
      getTagData: () => Promise.resolve({}),
      writeTags: () => new Promise<undefined>(() => undefined),
    });
    startRequest(props);
    void tagCache.writeTags([{ tag: 'product' }]);
    startRequest(props);
    await cdn.invalidateTags(['product']);

    expect(stub.purgeTags).toHaveBeenCalledWith(['product']);
  });

  it('purges at most 100 tags per call', async () => {
    const { cdn } = await overrides();
    const { stub, props } = routerProps();
    const tags = Array.from({ length: 150 }, (_, i) => `t${i}`);

    startRequest(props);
    await cdn.invalidateTags(tags);

    expect(stub.purgeTags.mock.calls).toEqual([[tags.slice(0, 100)], [tags.slice(100)]]);
  });

  it('sends revalidated tags and paths to the purge stub', async () => {
    const { cdn } = await overrides();
    const { stub, props } = routerProps();

    startRequest(props);
    await cdn.invalidateTags(['product', '_N_T_/en/page']);
    await cdn.invalidatePaths([{ rawPath: '/x' }]);

    expect(stub.purgeTags.mock.calls).toEqual([[['product', '_N_T_/en/page']], [['_N_T_/x']]]);
  });

  it('waits for an in-flight tag write before purging', async () => {
    const { tagCache, cdn } = await overrides();
    const { stub, props } = routerProps();
    const { promise: write, resolve: finishWrite } = Promise.withResolvers<undefined>();

    vi.spyOn(tagShards, 'get').mockReturnValue({
      getTagData: () => Promise.resolve({}),
      writeTags: () => write,
    });
    startRequest(props);

    const writing = tagCache.writeTags([{ tag: 'product' }]);
    const purging = cdn.invalidateTags(['product']);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(stub.purgeTags).not.toHaveBeenCalled();

    finishWrite(undefined);
    await Promise.all([writing, purging]);

    expect(stub.purgeTags).toHaveBeenCalledWith(['product']);
  });

  it('skips the purge without the stub and surfaces a failed purge', async () => {
    const { cdn } = await overrides();

    startRequest({});
    await expect(cdn.invalidateTags(['product'])).resolves.toBeUndefined();
    await expect(cdn.invalidatePaths([{ rawPath: '/x' }])).resolves.toBeUndefined();

    startRequest({
      CATALYST_CACHE_PURGE: { purgeTags: () => Promise.reject(new Error('boom')) },
      CATALYST_CACHE_TAG_PREFIX: 'p:',
    });
    await expect(cdn.invalidateTags(['product'])).rejects.toThrow('boom');
  });

  it('skips the purge outside a request', async () => {
    const { cdn } = await overrides();

    Reflect.deleteProperty(globalThis, Symbol.for('__cloudflare-context__'));

    await expect(cdn.invalidateTags(['product'])).resolves.toBeUndefined();
  });
});
