import PLazy from 'p-lazy';
import { Suspense, use } from 'react';
import { v4 as uuid } from 'uuid';

export type Streamable<T> = T | Promise<T>;

// eslint-disable-next-line func-names
const stableKeys = (function () {
  const cache = new WeakMap<object, string>();

  function getObjectKey(obj: object): string {
    const key = cache.get(obj);

    if (key !== undefined) {
      return key;
    }

    const keyValue = uuid();

    cache.set(obj, keyValue);

    return keyValue;
  }

  return {
    get: (streamable: unknown): string =>
      streamable != null && typeof streamable === 'object'
        ? getObjectKey(streamable)
        : JSON.stringify(streamable),
  };
})();

function getCompositeKey(streamables: readonly unknown[]): string {
  return streamables.map(stableKeys.get).join('.');
}

// Interface for cache implementations
interface Cache<K, V> {
  get(key: K): V | undefined;
  set(key: K, value: V): void;
}

// Implementation using WeakRef and FinalizationRegistry
function createWeakRefCache<K, V extends object>(): Cache<K, V> {
  const cache = new Map<K, WeakRef<V>>();
  const registry = new FinalizationRegistry((key: K) => {
    const valueRef = cache.get(key);

    if (valueRef && !valueRef.deref()) cache.delete(key);
  });

  return {
    get: (key: K) => cache.get(key)?.deref(),
    set: (key: K, value: V) => {
      cache.set(key, new WeakRef(value));
      registry.register(value, key);
    },
  };
}

// Fallback implementation using LRU strategy
function createLRUCache<K, V>(maxSize = 1000): Cache<K, V> {
  const cache = new Map<K, V>();
  const accessOrder = new Map<K, number>(); // Track last access time
  let accessCounter = 0;

  const cleanup = () => {
    if (cache.size <= maxSize) return;

    // Find the least recently used entries
    const entries = Array.from(accessOrder.entries());

    entries.sort((a, b) => a[1] - b[1]);

    // Remove oldest entries until we're under the limit
    const entriesToRemove = entries.slice(0, entries.length - maxSize);

    // Replace for...of loop with forEach to avoid linter error
    entriesToRemove.forEach(([key]) => {
      cache.delete(key);
      accessOrder.delete(key);
    });
  };

  return {
    get: (key: K) => {
      const value = cache.get(key);

      if (value !== undefined) {
        // Update access time - avoid ++ operator
        accessCounter += 1;
        accessOrder.set(key, accessCounter);
      }

      return value;
    },
    set: (key: K, value: V) => {
      cache.set(key, value);
      // Avoid ++ operator
      accessCounter += 1;
      accessOrder.set(key, accessCounter);
      cleanup();
    },
  };
}

// Create the appropriate cache based on feature detection
function createCache<K, V extends object>(): Cache<K, V> {
  const hasWeakRef = typeof WeakRef !== 'undefined';
  const hasFinalizationRegistry = typeof FinalizationRegistry !== 'undefined';

  if (hasWeakRef && hasFinalizationRegistry) {
    return createWeakRefCache<K, V>();
  }

  return createLRUCache<K, V>();
}

const promiseCache = createCache<string, Promise<unknown>>();

// eslint-disable-next-line valid-jsdoc
/**
 * A suspense-friendly upgrade to `Promise.all`, guarantees stability of
 * the returned promise instance if passed an identical set of inputs.
 */
function all<T extends readonly unknown[] | []>(
  streamables: T,
): Streamable<{ -readonly [P in keyof T]: Awaited<T[P]> }> {
  const cacheKey = getCompositeKey(streamables);

  const cached = promiseCache.get(cacheKey);

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  if (cached != null) return cached as { -readonly [P in keyof T]: Awaited<T[P]> };

  const result = Promise.all(streamables);

  promiseCache.set(cacheKey, result);

  return result;
}

function from<T>(thunk: () => Promise<T>): Streamable<T> {
  return PLazy.from(thunk);
}

export const Streamable = {
  all,
  from,
};

export function useStreamable<T>(streamable: Streamable<T>): T {
  return streamable instanceof Promise ? use(streamable) : streamable;
}

function UseStreamable<T>({
  value,
  children,
}: {
  value: Streamable<T>;
  children: (value: T) => React.ReactNode;
}) {
  return children(useStreamable(value));
}

export function Stream<T>({
  value,
  fallback,
  children,
}: {
  value: Streamable<T>;
  fallback?: React.ReactNode;
  children: (value: T) => React.ReactNode;
}) {
  return (
    <Suspense fallback={fallback}>
      <UseStreamable value={value}>{children}</UseStreamable>
    </Suspense>
  );
}
