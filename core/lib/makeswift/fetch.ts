import { fetch as makeswiftFetch } from '@makeswift/runtime/next';

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

function requestOption<K extends 'cache' | 'method'>(
  input: string | URL | Request,
  init: RequestInit | undefined,
  key: K,
): RequestInit[K] {
  return init?.[key] ?? (input instanceof Request ? input[key] : undefined);
}

export const fetch = (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
  const method = requestOption(input, init, 'method')?.toUpperCase() ?? 'GET';

  // Draft mode already sets `cache: 'no-store'`; pairing that with `revalidate` makes Next.js
  // discard both and fall back to caching the builder's edits indefinitely.
  const cacheable = method === 'GET' && requestOption(input, init, 'cache') !== 'no-store';

  return makeswiftFetch(input, {
    ...init,
    ...(cacheable && { next: { ...init?.next, revalidate: MAKESWIFT_REVALIDATE_TARGET } }),
  });
};
