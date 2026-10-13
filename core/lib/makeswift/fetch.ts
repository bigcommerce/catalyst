// Mirrors `MAKESWIFT_CACHE_TAG`, which `@makeswift/runtime` doesn't export. The publish webhook
// handled by `MakeswiftApiHandler` revalidates this tag.
const MAKESWIFT_CACHE_TAG = '@@makeswift';

// Makeswift tags its API responses but declares no revalidate window, and
// `app/[locale]/layout.tsx` sets `fetchCache = 'default-cache'`, so without a TTL Next.js
// caches them indefinitely. In production the publish webhook revalidates the `@@makeswift`
// tag, making this only a backstop; it stays long because time-based expiry serves the
// previous response to the request that triggers the refresh. Makeswift cannot reach a local
// dev server, where the TTL is the only invalidation, so development defaults to 0.
const MAKESWIFT_REVALIDATE_TARGET = resolveRevalidateTarget();

function resolveRevalidateTarget(): number {
  const override = process.env.MAKESWIFT_REVALIDATE_TARGET;

  if (override) {
    return Number(override);
  }

  return process.env.NODE_ENV === 'development' ? 0 : 3600;
}

// The runtime's API client calls this with a `Request`, so `cache` and `method` live on the input
// rather than on `init`.
function requestOption<K extends 'cache' | 'method'>(
  input: string | URL | Request,
  init: RequestInit | undefined,
  key: K,
): RequestInit[K] {
  return init?.[key] ?? (input instanceof Request ? input[key] : undefined);
}

// Replaces `fetch` from `@makeswift/runtime/next`, which overwrites `init.next` and so leaves no
// way to add a revalidate window.
export const fetch = (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
  const method = requestOption(input, init, 'method')?.toUpperCase() ?? 'GET';

  // Draft mode sets `cache: 'no-store'`; pairing that with `revalidate` makes Next.js discard
  // both and fall back to caching the builder's edits indefinitely.
  const cacheable = method === 'GET' && requestOption(input, init, 'cache') !== 'no-store';

  return globalThis.fetch(input, {
    ...init,
    next: {
      tags: [MAKESWIFT_CACHE_TAG],
      ...(cacheable && { revalidate: MAKESWIFT_REVALIDATE_TARGET }),
    },
  });
};
